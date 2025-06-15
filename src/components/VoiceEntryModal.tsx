
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Square, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTransactionOperations } from '@/hooks/useTransactionOperations';

interface VoiceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const VoiceEntryModal = ({ isOpen, onClose, onComplete }: VoiceEntryModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { handleAddTransaction, loading } = useTransactionOperations();

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        processAudioToText(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const processAudioToText = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Call your voice-to-text edge function
        const response = await fetch('/api/voice-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio: base64Audio }),
        });

        if (response.ok) {
          const { text } = await response.json();
          setTranscript(text);
          parseTransactionFromText(text);
        } else {
          throw new Error('Failed to process audio');
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseTransactionFromText = async (text: string) => {
    try {
      // Simple parsing logic - you can enhance this with AI
      const lowerText = text.toLowerCase();
      
      // Determine transaction type
      const isExpense = lowerText.includes('spent') || lowerText.includes('paid') || lowerText.includes('bought');
      const isIncome = lowerText.includes('earned') || lowerText.includes('received') || lowerText.includes('salary');
      
      // Extract amount using regex
      const amountMatch = text.match(/(\d+(?:\.\d{2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      
      // Simple category detection
      let category = 'Other';
      if (lowerText.includes('food') || lowerText.includes('lunch') || lowerText.includes('dinner')) {
        category = 'Food';
      } else if (lowerText.includes('gas') || lowerText.includes('fuel') || lowerText.includes('uber')) {
        category = 'Transportation';
      } else if (lowerText.includes('grocery') || lowerText.includes('supermarket')) {
        category = 'Groceries';
      } else if (lowerText.includes('salary') || lowerText.includes('wage')) {
        category = 'Salary';
      }

      if (amount > 0) {
        await handleAddTransaction({
          type: isIncome ? 'income' : 'expense',
          amount,
          category,
          description: text,
          transaction_date: new Date().toISOString().split('T')[0],
        });
        
        toast.success(`Transaction added: ${isIncome ? 'Income' : 'Expense'} of $${amount}`);
        onComplete();
      } else {
        toast.error('Could not extract transaction details from voice input');
      }
    } catch (error) {
      console.error('Error parsing transaction:', error);
      toast.error('Failed to create transaction from voice input');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Entry
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Recording Status */}
          <div className="text-center">
            {isRecording && (
              <Badge variant="destructive" className="mb-2">
                Recording {formatTime(recordingTime)}
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="secondary" className="mb-2">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing...
              </Badge>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full"
                disabled={isProcessing}
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="outline"
                className="px-8 py-3 rounded-full"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Audio Playback */}
          {audioUrl && (
            <div className="space-y-2">
              <h4 className="font-medium">Recorded Audio:</h4>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="space-y-2">
              <h4 className="font-medium">Transcript:</h4>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                {transcript}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium mb-1">Instructions:</h4>
            <p>Speak clearly and include:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Amount (e.g., "50 dollars")</li>
              <li>Type (e.g., "I spent" or "I earned")</li>
              <li>Category (e.g., "on food", "for groceries")</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Example: "I spent 25 dollars on lunch at McDonald's"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

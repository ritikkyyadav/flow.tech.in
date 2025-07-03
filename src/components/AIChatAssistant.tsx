
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, Trash2 } from "lucide-react";
import { useAI } from "@/contexts/AIContext";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatAssistant = ({ isOpen, onClose }: AIChatAssistantProps) => {
  const { makeAIRequest, isFeatureEnabled } = useAI();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m Flow AI, your intelligent financial assistant powered by Google Gemini. I can help you with expense tracking, budget planning, financial insights, and answer questions about your finances. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const predefinedQuestions = [
    "How much did I spend on food this month?",
    "What's my savings rate?",
    "Create a budget plan for next month",
    "Show me my expense trends"
  ];

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts
  useEffect(() => {
    if (isOpen && user) {
      loadChatHistory();
    }
  }, [isOpen, user]);

  // Save chat history to localStorage
  const saveChatHistory = (newMessages: Message[]) => {
    if (user) {
      const chatKey = `flow-ai-chat-${user.id}`;
      localStorage.setItem(chatKey, JSON.stringify(newMessages));
    }
  };

  // Load chat history from localStorage
  const loadChatHistory = () => {
    if (user) {
      const chatKey = `flow-ai-chat-${user.id}`;
      const savedHistory = localStorage.getItem(chatKey);
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          setMessages(parsedHistory);
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    const initialMessage = {
      id: '1',
      type: 'ai' as const,
      content: 'Hello! I\'m Flow AI, your intelligent financial assistant powered by Google Gemini. I can help you with expense tracking, budget planning, financial insights, and answer questions about your finances. How can I assist you today?',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    if (user) {
      const chatKey = `flow-ai-chat-${user.id}`;
      localStorage.removeItem(chatKey);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      saveChatHistory(newMessages);
      return newMessages;
    });
    setInputMessage('');
    setIsLoading(true);

    try {
      if (isFeatureEnabled('chatAssistant')) {
        // Use actual AI request with Google Gemini
        const aiResponse = await makeAIRequest({
          prompt: `You are Flow AI, a financial assistant. The user asks: "${inputMessage}". Provide helpful financial advice and insights. Keep responses concise and actionable.`,
          provider: 'google',
          model: 'gemini-pro',
          tokens: 0,
          cost: 0
        });

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => {
          const newMessages = [...prev, aiMessage];
          saveChatHistory(newMessages);
          return newMessages;
        });
      } else {
        // Fallback response when AI is not enabled
        const fallbackResponse = generateFallbackResponse(inputMessage);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: fallbackResponse,
          timestamp: new Date()
        };
        setMessages(prev => {
          const newMessages = [...prev, aiMessage];
          saveChatHistory(newMessages);
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an issue processing your request. Please try again or contact support if the problem persists.',
        timestamp: new Date()
      };
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        saveChatHistory(newMessages);
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('food') || input.includes('eat')) {
      return 'Based on your recent transactions, you\'ve spent ₹15,000 on food and dining this month. This is 25% higher than your average. Consider meal planning to optimize costs.';
    } else if (input.includes('savings') || input.includes('save')) {
      return 'Your current savings rate is 38.2%, which is excellent! You\'re saving ₹32,500 per month. You could potentially save an additional ₹5,000 by optimizing your subscription expenses.';
    } else if (input.includes('budget')) {
      return 'I can help you create a budget plan! Based on your income of ₹85,000, I recommend: 50% for needs (₹42,500), 30% for wants (₹25,500), and 20% for savings (₹17,000). Would you like me to break this down by categories?';
    } else if (input.includes('trend') || input.includes('analysis')) {
      return 'Your expense trends show: Transportation costs have increased by 15% this month, while utility expenses have decreased by 8%. Your income has grown consistently by 12.5% compared to last month.';
    } else {
      return 'I understand you\'re asking about your finances. Could you be more specific? I can help with expense analysis, budget planning, savings goals, or explain any financial concepts.';
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Flow AI Assistant
              {isFeatureEnabled('chatAssistant') && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Powered by Gemini
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChatHistory}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-gradient-to-r from-blue-600 to-orange-500' : 'bg-gray-200'}`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white' 
                        : 'bg-gray-100 text-black'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="p-2 rounded-full bg-gray-200">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100 text-black">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {predefinedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs text-left justify-start h-auto p-2"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Ask me anything about your finances..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              className="bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:from-blue-700 hover:to-orange-600"
              disabled={isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

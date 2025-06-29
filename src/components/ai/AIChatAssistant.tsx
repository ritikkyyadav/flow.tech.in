
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Brain, User, Bot, Mic, MicOff, TrendingDown, Target, PieChart, BarChart3 } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

export const AIChatAssistant = () => {
  const { isFeatureEnabled, makeAIRequest } = useAI();
  const { transactions, addTransaction } = useTransactions();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'expense-summary',
      label: 'Expense Summary',
      prompt: 'Give me a summary of my expenses this month',
      icon: <TrendingDown className="w-4 h-4" />
    },
    {
      id: 'savings-advice',
      label: 'Savings Tips',
      prompt: 'How can I save more money based on my spending patterns?',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'budget-help',
      label: 'Budget Planning',
      prompt: 'Help me create a budget plan for next month',
      icon: <PieChart className="w-4 h-4" />
    },
    {
      id: 'category-analysis',
      label: 'Category Analysis',
      prompt: 'Which category am I spending the most on and why?',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive"
        });
      };
    }

    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: "Hello! I'm your AI financial assistant. I can help you analyze your spending, create budgets, categorize transactions, and provide personalized financial advice. How can I help you today?",
        timestamp: new Date()
      }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(messageToSend);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Prepare context with financial data
    const context = prepareFinancialContext();
    
    const prompt = `You are a helpful financial assistant for WITHU financial management app. 
    User's financial context: ${JSON.stringify(context)}
    
    User's question: ${userMessage}
    
    Provide helpful, personalized financial advice based on their data. Be conversational and practical. 
    If they ask about specific transactions or categories, reference their actual data.
    If they want to add transactions or perform actions, acknowledge that you can help with that.`;

    return await makeAIRequest({
      provider: 'openai', // Should come from settings
      model: 'gpt-3.5-turbo',
      prompt,
      tokens: 0,
      cost: 0
    });
  };

  const prepareFinancialContext = () => {
    const currentMonth = new Date().getMonth();
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.transaction_date).getMonth() === currentMonth
    );

    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const income = currentMonthTransactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return {
      totalTransactions: transactions.length,
      currentMonthExpenses: totalExpenses,
      currentMonthIncome: totalIncome,
      topCategories: Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount })),
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0
    };
  };

  const startListening = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    } else {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setIsListening(false);
  };

  if (!isFeatureEnabled('chatAssistant')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium">AI Assistant Disabled</h3>
            <p className="text-gray-600">Enable the AI chat assistant in settings to get personalized help.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Financial Assistant
          <Badge variant="outline">Online</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage(action.prompt)}
              disabled={isLoading}
              className="text-xs"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                  {message.type === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about your finances..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button
            onClick={isListening ? stopListening : startListening}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

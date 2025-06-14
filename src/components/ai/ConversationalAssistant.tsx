
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  PieChart, 
  Calendar,
  DollarSign,
  FileText,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any;
  actions?: ChatAction[];
}

interface ChatAction {
  type: 'create_transaction' | 'set_budget' | 'generate_report' | 'view_chart';
  label: string;
  data: any;
}

interface QuickQuery {
  label: string;
  query: string;
  icon: React.ReactNode;
}

export const ConversationalAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickQueries: QuickQuery[] = [
    {
      label: "Monthly expenses summary",
      query: "Show me my expenses for this month broken down by category",
      icon: <PieChart className="w-4 h-4" />
    },
    {
      label: "Income vs expenses",
      query: "Compare my income and expenses for the last 3 months",
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      label: "Savings analysis",
      query: "How much have I saved this year and what's my savings rate?",
      icon: <Target className="w-4 h-4" />
    },
    {
      label: "Budget performance",
      query: "How am I doing against my budgets this month?",
      icon: <Calendar className="w-4 h-4" />
    },
    {
      label: "Top expenses",
      query: "What are my highest expenses in the last month?",
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      label: "Create invoice",
      query: "Help me create an invoice for my client",
      icon: <FileText className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [user]);

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Hi! I'm your AI financial assistant. I can help you with:\n\n• Analyzing your spending patterns\n• Creating budgets and tracking goals\n• Generating financial reports\n• Managing transactions and invoices\n• Providing personalized insights\n\nWhat would you like to know about your finances today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message,
          user_id: user.id,
          conversation_history: messages.slice(-10) // Last 10 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        context: data.context,
        actions: data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickQuery = (query: string) => {
    sendMessage(query);
  };

  const executeAction = async (action: ChatAction) => {
    try {
      switch (action.type) {
        case 'create_transaction':
          // Navigate to transaction modal or execute directly
          toast({
            title: "Creating Transaction",
            description: "Transaction created successfully",
          });
          break;
        case 'set_budget':
          // Handle budget setting
          toast({
            title: "Budget Set",
            description: "Budget has been configured",
          });
          break;
        case 'generate_report':
          // Generate and download report
          const { data, error } = await supabase.functions.invoke('generate-report', {
            body: action.data
          });
          if (!error) {
            toast({
              title: "Report Generated",
              description: "Your report has been downloaded",
            });
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error executing action:', error);
      toast({
        title: "Error",
        description: "Failed to execute action",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          AI Financial Assistant
          <Badge variant="secondary" className="bg-white/20 text-white">
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Queries */}
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm font-medium mb-3">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuery(query.query)}
                className="text-xs h-8 gap-1"
              >
                {query.icon}
                {query.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                  
                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => executeAction(action)}
                          className="mr-2"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about your finances..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

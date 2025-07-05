
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Send, Paperclip, Mic, Image, FileText, Video, X, Menu, Settings, Search, MoreVertical, MessageSquare, Bot, Plus, TrendingUp, DollarSign, Calculator, FileSpreadsheet, Clock, ChevronRight } from "lucide-react";
import { useAI } from "@/contexts/AIContext";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  fileType?: string;
}

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatAssistant = ({ isOpen, onClose }: AIChatAssistantProps) => {
  const { makeAIRequest, isFeatureEnabled } = useAI();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your Flow AI assistant. I can help you with financial insights, transaction analysis, budget planning, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          // Ensure timestamps are Date objects
          const messagesWithDates = parsedHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        const voiceMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: "🎤 Voice message",
          timestamp: new Date(),
          isVoice: true
        };
        setMessages(prev => [...prev, voiceMessage]);
      }, 3000);
    }
  };

  const handleFileUpload = (type: string) => {
    setShowUploadMenu(false);
    const fileMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `📎 ${type} uploaded`,
      timestamp: new Date(),
      fileType: type
    };
    setMessages(prev => [...prev, fileMessage]);
  };

  const formatTime = (timestamp: Date) => {
    // Ensure timestamp is a Date object
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const chatHistory = [
    { id: 1, title: "Budget Analysis", lastMessage: "Your monthly budget is...", time: "2 min ago", unread: 2, active: true },
    { id: 2, title: "Transaction Review", lastMessage: "Found 3 unusual transactions", time: "1 hour ago", unread: 0 },
    { id: 3, title: "Savings Goals", lastMessage: "You're 70% towards your goal", time: "Today", unread: 0 },
    { id: 4, title: "Expense Report", lastMessage: "Report generated successfully", time: "Yesterday", unread: 0 },
    { id: 5, title: "Investment Advice", lastMessage: "Based on your risk profile...", time: "Jan 3", unread: 0 },
    { id: 6, title: "Tax Planning", lastMessage: "Here are some deductions...", time: "Jan 2", unread: 0 }
  ];

  const quickActions = [
    { icon: TrendingUp, label: "Analyze Spending", color: "from-blue-500 to-blue-600" },
    { icon: DollarSign, label: "Budget Overview", color: "from-green-500 to-green-600" },
    { icon: Calculator, label: "Calculate Savings", color: "from-purple-500 to-purple-600" },
    { icon: FileSpreadsheet, label: "Export Report", color: "from-orange-500 to-orange-600" }
  ];

  const suggestedQueries = [
    "What's my spending trend this month?",
    "How can I optimize my budget?",
    "Show me my top expenses",
    "Calculate my savings rate"
  ];

  const clearChatHistory = () => {
    const initialMessage = {
      id: '1',
      type: 'ai' as const,
      content: "Hello! I'm your Flow AI assistant. I can help you with financial insights, transaction analysis, budget planning, and more. How can I assist you today?",
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    if (user) {
      const chatKey = `flow-ai-chat-${user.id}`;
      localStorage.removeItem(chatKey);
    }
  };

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-full h-screen max-h-screen w-full m-0 p-0 rounded-none">
          <div className="flex flex-col h-full bg-gray-50">
            {/* Mobile Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Flow AI Assistant</h3>
                  <p className="text-xs text-gray-500">AI-Powered Financial Insights</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Quick Actions - Mobile */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
              <div className="flex space-x-2 overflow-x-auto">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 transition-colors group min-w-[80px]"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area - Mobile */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 1 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Questions</h4>
                  <div className="space-y-2">
                    {suggestedQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(query)}
                        className="text-left p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-700 w-full border border-gray-200"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {message.type === 'ai' && (
                      <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      } shadow-sm`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white border border-gray-200">
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

            {/* Input Area - Mobile */}
            <div className="bg-white border-t border-gray-200 p-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {showUploadMenu && (
                    <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[180px] z-50">
                      <button
                        onClick={() => handleFileUpload('Financial Document')}
                        className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Document</span>
                      </button>
                      <button
                        onClick={() => handleFileUpload('Receipt Image')}
                        className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Image className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">Image</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your finances..."
                    className="w-full px-3 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pr-10 text-sm"
                  />
                  <button
                    onClick={toggleRecording}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-center mt-2">
                <p className="text-xs text-gray-500">
                  <span className="inline-flex items-center">
                    <Bot className="w-3 h-3 mr-1" />
                    AI-Powered by Flow Finance
                  </span>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop version
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl h-[80vh] p-0">
        <div className="flex h-full bg-gray-50">
          {/* Sidebar */}
          <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
                <button 
                  onClick={clearChatHistory}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {chatHistory.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                    chat.active ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">{chat.title}</h4>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="inline-flex items-center justify-center mt-1 px-2 py-0.5 text-xs font-medium text-white bg-blue-600 rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Flow AI Assistant</h3>
                      <p className="text-sm text-gray-500">AI-Powered Financial Insights</p>
                      {isFeatureEnabled('chatAssistant') && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Powered by Gemini
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-600">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.length === 1 && (
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Questions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(query)}
                        className="text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-700"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      } shadow-sm`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-2xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800">
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

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Upload Menu */}
                  {showUploadMenu && (
                    <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[200px] z-50">
                      <button
                        onClick={() => handleFileUpload('Financial Document')}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-700">Financial Document</span>
                      </button>
                      <button
                        onClick={() => handleFileUpload('Receipt Image')}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Image className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-700">Receipt Image</span>
                      </button>
                      <button
                        onClick={() => handleFileUpload('Statement')}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-700">Statement</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your finances, transactions, or budgets..."
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pr-12"
                  />
                  <button
                    onClick={toggleRecording}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-center mt-3">
                <p className="text-xs text-gray-500">
                  <span className="inline-flex items-center">
                    <Bot className="w-3 h-3 mr-1" />
                    AI-Powered by Flow Finance
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

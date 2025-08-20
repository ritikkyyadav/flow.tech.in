
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { AIChatAssistant } from "@/components/AIChatAssistant"; // legacy (kept for fallback or other areas)
import PremiumAIChat from "@/components/PremiumAIChat";
import { useAIChat } from "@/hooks/useAIChat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  FileText, 
  Settings,
  User,
  Plus,
  MessageSquare,
  LogOut,
  Home,
  BarChart3,
  Target,
  Database,
  Flag,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  Search,
  ChevronLeft,
  List
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const DashboardLayout = ({ children, activeTab = "dashboard", onTabChange }: DashboardLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: showAIAssistant, openChat: setShowAIAssistant, closeChat } = useAIChat();

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", color: "from-blue-500 to-blue-600" },
    { id: "transactions", icon: TrendingUp, label: "Transactions", color: "from-emerald-500 to-green-600" },
    { id: "budget", icon: Target, label: "Budget", color: "from-purple-500 to-purple-600" },
  { id: "invoices", icon: FileText, label: "Invoices", color: "from-orange-500 to-orange-600" },
  { id: "accounting", icon: FileText, label: "Accounting", color: "from-slate-500 to-slate-600" },
    { id: "reports", icon: BarChart3, label: "Reports", color: "from-pink-500 to-pink-600" },
    { id: "data", icon: Database, label: "Data Management", color: "from-indigo-500 to-indigo-600" },
    { id: "indian", icon: Flag, label: "Indian Features", color: "from-red-500 to-red-600" },
    { id: "subscription", icon: Plus, label: "Subscription", color: "from-yellow-500 to-yellow-600" },
    { id: "profile", icon: User, label: "Profile", color: "from-cyan-500 to-cyan-600" },
    { id: "settings", icon: Settings, label: "Settings", color: "from-gray-500 to-gray-600" },
  ];

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleMenuClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'transactions':
        navigate('/transactions');
        break;
      case 'budget':
        navigate('/budget');
        break;
      case 'invoices':
        navigate('/invoices');
        break;
      case 'accounting':
        navigate('/accounting');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'data':
        navigate('/data-management');
        break;
      case 'indian':
        navigate('/indian-features');
        break;
      case 'subscription':
        navigate('/subscription');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleSidebar = () => {
    console.log('Toggling sidebar, current state:', isSidebarCollapsed);
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleAromaClick = () => {
    console.log('Flow AI Assistant clicked');
    setShowAIAssistant();
  };

  const activeMenuItem = menuItems.find(item => item.id === activeTab);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex w-full relative transition-colors duration-300">
        {/* Modern Sidebar with Glass Effect */}
        <motion.aside 
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className={cn(
            "backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-r border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-50 shadow-2xl",
            isSidebarCollapsed ? "w-20" : "w-72"
          )}
        >
          {/* Logo Section with Animation */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Flow
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">AI-Powered Finance</p>
                  </motion.div>
                )}
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Navigation with Hover Effects */}
          <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const isActive = item.id === activeTab;
                return (
                  <motion.li 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start group relative overflow-hidden transition-all duration-300",
                        isActive 
                          ? "bg-gradient-to-r text-white shadow-lg" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800",
                        isActive && item.color,
                        isSidebarCollapsed && "px-3"
                      )}
                      onClick={() => handleMenuClick(item.id)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      )}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative z-10"
                      >
                        <item.icon className={cn(
                          "w-5 h-5",
                          isActive ? "text-white" : "text-gray-600 dark:text-gray-400"
                        )} />
                      </motion.div>
                      {!isSidebarCollapsed && (
                        <motion.span 
                          className={cn(
                            "ml-3 relative z-10",
                            isActive ? "text-white font-semibold" : "text-gray-700 dark:text-gray-300"
                          )}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                      {!isSidebarCollapsed && !isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10"
                          initial={false}
                          whileHover={{ opacity: 0.1 }}
                        />
                      )}
                    </Button>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile Section with Glass Effect */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 backdrop-blur-xl bg-white/50 dark:bg-gray-800/50">
            <motion.div 
              className="flex items-center space-x-3 mb-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium Plan</p>
                </div>
              )}
            </motion.div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div 
          className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            isSidebarCollapsed ? "ml-20" : "ml-72"
          )}
        >
          {/* Modern Header with Glass Effect */}
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 sticky top-0 z-40 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="text-gray-600 lg:hidden"
                >
                  <List className="w-5 h-5" />
                </Button>
                <motion.div 
                  className="flex-1 max-w-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {activeMenuItem?.label || "Dashboard"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Track your finances with AI-powered insights
                  </p>
                </motion.div>

                {/* Search Bar */}
                <div className="hidden lg:block flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search transactions, reports..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <AnimatePresence mode="wait">
                    {isDarkMode ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                      >
                        <Sun className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                      >
                        <Moon className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </motion.button>

                {/* Quick Actions */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10"
                    onClick={() => handleMenuClick('transactions')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Quick Add
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm"
                    onClick={setShowAIAssistant}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Flow AI
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Main Content with Animation */}
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Premium AI Chat Modal (replaces legacy AIChatAssistant) */}
      <AnimatePresence>
        {showAIAssistant && (
          <PremiumAIChat isOpen={showAIAssistant} onClose={closeChat} />
        )}
      </AnimatePresence>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-6 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notifications</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-800 dark:text-gray-200">New transaction added successfully</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-800 dark:text-gray-200">Monthly report is ready</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { 
  TrendingUp, 
  FileText, 
  Settings,
  User,
  List,
  Plus,
  MessageSquare,
  LogOut,
  Home,
  BarChart3,
  Target,
  Database,
  Flag
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const DashboardLayout = ({ children, activeTab = "dashboard", onTabChange }: DashboardLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", active: activeTab === "dashboard" },
    { id: "transactions", icon: TrendingUp, label: "Transactions", active: activeTab === "transactions" },
    { id: "budget", icon: Target, label: "Budget", active: activeTab === "budget" },
    { id: "invoices", icon: FileText, label: "Invoices", active: activeTab === "invoices" },
    { id: "reports", icon: BarChart3, label: "Reports", active: activeTab === "reports" },
    { id: "data", icon: Database, label: "Data Management", active: activeTab === "data" },
    { id: "indian", icon: Flag, label: "Indian Features", active: activeTab === "indian" },
    { id: "subscription", icon: Plus, label: "Subscription", active: activeTab === "subscription" },
    { id: "profile", icon: User, label: "Profile", active: activeTab === "profile" },
    { id: "settings", icon: Settings, label: "Settings", active: activeTab === "settings" },
  ];

  const handleMenuClick = (itemId: string) => {
    console.log('Menu clicked:', itemId);
    
    // Handle navigation for different tabs
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
      default:
        console.log('Unknown menu item:', itemId);
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
    setShowAIAssistant(true);
  };

  // Ensure sidebar visibility is maintained across route changes
  useEffect(() => {
    console.log('Route changed to:', location.pathname);
  }, [location.pathname]);

  return (
    <>
      <div className="min-h-screen bg-white flex w-full relative">
        {/* Sidebar - Fixed positioning with proper z-index */}
        <aside 
          className={cn(
            "bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-50",
            isSidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Logo */}
          <div className="p-6 border-b border-blue-500/30 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/f270ce25-b700-4c54-b8a9-489a6d7cf9d3.png" 
                  alt="Flow Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-300 to-blue-300 bg-clip-text text-transparent">Flow</h1>
                  <p className="text-blue-200 text-sm">AI-Powered Finance</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-white hover:bg-blue-500/30",
                      item.active && "bg-blue-500/50 text-white",
                      isSidebarCollapsed && "px-2"
                    )}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <item.icon className="w-5 h-5" />
                    {!isSidebarCollapsed && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-blue-500/30 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-400/30 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-blue-200">User</p>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-white hover:bg-blue-500/30"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              {!isSidebarCollapsed && (
                <span className="ml-2">Sign Out</span>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content - Adjusted margin to account for fixed sidebar */}
        <div 
          className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            isSidebarCollapsed ? "ml-16" : "ml-64"
          )}
        >
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="text-gray-600"
                >
                  <List className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                    {menuItems.find(item => item.active)?.label || "Dashboard"}
                  </h2>
                  <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:from-blue-700 hover:to-orange-600"
                  onClick={() => handleMenuClick('transactions')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Add
                </Button>
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  onClick={handleAromaClick}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Flow AI
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 bg-gray-50">
            {children}
          </main>
        </div>
      </div>

      {/* AI Chat Assistant Modal */}
      <AIChatAssistant 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)} 
      />
    </>
  );
};

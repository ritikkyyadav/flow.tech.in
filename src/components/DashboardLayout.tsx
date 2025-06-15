
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", active: activeTab === "dashboard" },
    { id: "transactions", icon: TrendingUp, label: "Transactions", active: activeTab === "transactions" },
    { id: "budget", icon: Target, label: "Budget", active: activeTab === "budget" },
    { id: "invoices", icon: FileText, label: "Invoices", active: activeTab === "invoices" },
    { id: "reports", icon: BarChart3, label: "Reports", active: activeTab === "reports" },
    { id: "data", icon: Database, label: "Data Management", active: activeTab === "data" },
    { id: "indian", icon: Flag, label: "Indian Features", active: activeTab === "indian" },
    { id: "profile", icon: User, label: "Profile", active: activeTab === "profile" },
    { id: "settings", icon: Settings, label: "Settings", active: activeTab === "settings" },
  ];

  const handleMenuClick = (itemId: string) => {
    console.log('Menu clicked:', itemId);
    
    if (onTabChange) {
      onTabChange(itemId);
    }
    
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

  return (
    <div className="min-h-screen bg-white flex w-full">
      {/* Sidebar - Fixed positioning to prevent disappearing */}
      <aside 
        className={cn(
          "bg-black text-white transition-all duration-300 flex flex-col fixed left-0 top-0 h-full z-40",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/lovable-uploads/12a1c034-ad16-4af1-b7a1-6c49b595421b.png" 
                alt="Withu Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">Withu</h1>
                <p className="text-gray-400 text-sm">AI-Powered Finance</p>
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
                    "w-full justify-start text-white hover:bg-gray-800",
                    item.active && "bg-gray-800",
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
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-400">User</p>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-gray-800"
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
                <h2 className="text-2xl font-bold text-black">
                  {menuItems.find(item => item.active)?.label || "Dashboard"}
                </h2>
                <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => handleMenuClick('transactions')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={() => console.log('AI Assistant clicked')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Assistant
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
  );
};

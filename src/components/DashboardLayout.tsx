
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
  BarChart3
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
    { id: "invoices", icon: FileText, label: "Invoices", active: activeTab === "invoices" },
    { id: "reports", icon: BarChart3, label: "Reports", active: activeTab === "reports" },
    { id: "profile", icon: User, label: "Profile", active: activeTab === "profile" },
    { id: "settings", icon: Settings, label: "Settings", active: activeTab === "settings" },
  ];

  const handleMenuClick = (itemId: string) => {
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
      case 'invoices':
        navigate('/invoices');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-black text-white transition-all duration-300 flex flex-col",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/lovable-uploads/0a001be8-de4d-4b8a-8807-fb97bd857f40.png" 
                alt="Withu Logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
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
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
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
        <div className="p-4 border-t border-gray-800">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
                onClick={() => handleMenuClick('add-transaction')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={() => handleMenuClick('ai-assistant')}
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

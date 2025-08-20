
import { Home, Plus, FileText, BarChart3, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    route: '/dashboard',
    badge: null
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: Plus,
    route: '/transactions',
    badge: null
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: FileText,
    route: '/invoices',
    badge: null
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    route: '/reports',
    badge: null
  },
  {
    id: 'data',
    label: 'Data',
    icon: Database,
    route: '/data-management',
    badge: null
  }
];

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab = 'dashboard', onTabChange }: BottomNavigationProps) => {
  const navigate = useNavigate();

  const handleTabClick = (tabId: string, route: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    navigate(route);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom">
      {/* Glass background */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/80 border-t border-white/60" />
      <div className="relative grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id, item.route)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors duration-200 min-h-[44px] relative tap-highlight-transparent",
                isActive 
                  ? "text-black font-semibold" 
                  : "text-gray-500 hover:text-gray-700 active:text-gray-800"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-all duration-200",
                  isActive ? "fill-current" : "stroke-current"
                )} 
              />
              <span className="truncate w-full text-center px-1">
                {item.label}
              </span>
              {item.badge && (
                <div className="absolute -top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </button>
          );
        })}
        {/* Floating Action Button */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <button
            onClick={() => handleTabClick('transactions', '/transactions')}
            aria-label="Quick Add"
            className={cn(
              'w-14 h-14 rounded-full shadow-xl transition-transform duration-150 active:scale-95',
              'bg-gradient-to-r from-blue-600 to-orange-500 text-white flex items-center justify-center'
            )}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

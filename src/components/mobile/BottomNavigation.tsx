
import { Home, Plus, FileText, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    badge: null
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: Plus,
    badge: null
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: FileText,
    badge: null
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    badge: null
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    badge: null
  }
];

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab = 'dashboard', onTabChange }: BottomNavigationProps) => {
  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors duration-200 min-h-[44px] relative",
                isActive 
                  ? "text-black font-semibold" 
                  : "text-gray-500 hover:text-gray-700"
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
      </div>
    </nav>
  );
};

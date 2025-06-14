
import { Home, Plus, FileText, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/',
    badge: null
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: Plus,
    path: '/transactions',
    badge: null
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: FileText,
    path: '/invoices',
    badge: null
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: '/reports',
    badge: null
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    badge: null
  }
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
};


import { ArrowLeft, Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  showNotifications?: boolean;
  onNotifications?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const MobileHeader = ({
  title,
  showBack = false,
  onBack,
  showSearch = false,
  onSearch,
  showNotifications = false,
  onNotifications,
  showMenu = false,
  onMenu,
  actions,
  className
}: MobileHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenu}
              className="p-2 -ml-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-black truncate">
            {title}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {actions}
          
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearch}
              className="p-2"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotifications}
              className="p-2 relative"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>
          )}
          
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};


import { ArrowLeft, Search, Bell, Menu, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  subtitle?: string;
}

export const MobileHeader = ({
  title,
  subtitle,
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
      "sticky top-0 z-50 bg-white border-b border-gray-200 mobile-shadow safe-area-top",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 -ml-2 focus-ring tap-highlight-transparent"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenu}
              className="p-2 -ml-2 focus-ring tap-highlight-transparent"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-black truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Custom actions */}
          {actions}
          
          {/* Search button */}
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearch}
              className="p-2 focus-ring tap-highlight-transparent"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotifications}
              className="p-2 relative focus-ring tap-highlight-transparent"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>
          )}
          
          {/* User Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="p-1 focus-ring tap-highlight-transparent"
                aria-label="User menu"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-white border border-gray-200 mobile-shadow z-50"
            >
              <DropdownMenuItem className="focus:bg-gray-100">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {user?.user_metadata?.full_name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100">
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 text-red-600">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

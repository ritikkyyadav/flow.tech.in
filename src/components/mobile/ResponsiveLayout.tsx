
import { ReactNode } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BottomNavigation } from "./BottomNavigation";
import { MobileHeader } from "./MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  showNotifications?: boolean;
  onNotifications?: () => void;
  headerActions?: ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const ResponsiveLayout = ({
  children,
  title,
  showBack,
  onBack,
  showSearch,
  onSearch,
  showNotifications,
  onNotifications,
  headerActions,
  className,
  activeTab = "dashboard",
  onTabChange
}: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    
    // Handle navigation for different tabs
    switch (tab) {
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
      default:
        break;
    }
  };

  if (!isMobile) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
        {children}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileHeader
        title={title}
        showBack={showBack}
        onBack={onBack}
        showSearch={showSearch}
        onSearch={onSearch}
        showNotifications={showNotifications}
        onNotifications={onNotifications}
        actions={headerActions}
      />
      
      <main className={cn(
        "flex-1 overflow-auto pb-20", // pb-20 for bottom navigation space
        className
      )}>
        {children}
      </main>
      
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

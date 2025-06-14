
import { ReactNode } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BottomNavigation } from "./BottomNavigation";
import { MobileHeader } from "./MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
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
  className
}: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <DashboardLayout>
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
      
      <BottomNavigation />
    </div>
  );
};

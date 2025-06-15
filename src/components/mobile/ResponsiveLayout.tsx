
import { MobileHeader } from "./MobileHeader";
import { BottomNavigation } from "./BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title: string;
  activeTab: string;
  headerActions?: React.ReactNode;
}

export const ResponsiveLayout = ({ children, title, activeTab, headerActions }: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <MobileHeader 
          title={title} 
          actions={
            <div className="flex items-center gap-2">
              <NotificationBell />
              {headerActions}
            </div>
          }
        />
        <div className="pt-16">
          {children}
        </div>
        <BottomNavigation activeTab={activeTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center gap-2">
          <NotificationBell />
          {headerActions}
        </div>
      </div>
      {children}
    </div>
  );
};

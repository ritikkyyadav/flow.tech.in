
import { MobileHeader } from "./MobileHeader";
import { BottomNavigation } from "./BottomNavigation";
import { PWAInstall } from "./PWAInstall";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title: string;
  activeTab: string;
  headerActions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export const ResponsiveLayout = ({ 
  children, 
  title, 
  activeTab, 
  headerActions,
  showBackButton = false,
  onBack,
  className = ""
}: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };

    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  // Mobile Layout (< 768px)
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 safe-area-top">
        <MobileHeader 
          title={title} 
          showBack={showBackButton}
          onBack={onBack}
          actions={
            <div className="flex items-center gap-2">
              <NotificationBell />
              {headerActions}
            </div>
          }
        />
        <main className="pt-16 min-h-screen">
          <div className="container-responsive padding-responsive">
            {children}
          </div>
        </main>
        <BottomNavigation activeTab={activeTab} />
        <PWAInstall />
      </div>
    );
  }

  // Tablet Layout (768px - 1024px)
  if (isTablet) {
    return (
      <div className={cn("min-h-screen bg-gray-50", className)}>
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 mobile-shadow">
          <div className="container-responsive">
            <div className="flex justify-between items-center h-16 px-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/lovable-uploads/f270ce25-b700-4c54-b8a9-489a6d7cf9d3.png" 
                    alt="Flow Logo" 
                    className="w-8 h-8"
                  />
                  <h1 className="text-xl font-bold flow-gradient-text">Flow</h1>
                </div>
                <div className="h-6 w-px bg-gray-300" />
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell />
                {headerActions}
              </div>
            </div>
          </div>
        </header>
        
        <main className="container-responsive padding-responsive">
          {children}
        </main>
      </div>
    );
  }

  // Desktop Layout (>= 1024px)
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <header className="bg-white border-b border-gray-200">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16 px-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/f270ce25-b700-4c54-b8a9-489a6d7cf9d3.png" 
                  alt="Flow Logo" 
                  className="w-10 h-10"
                />
                <div>
                  <h1 className="text-xl font-bold flow-gradient-text">Flow</h1>
                  <p className="text-xs text-gray-500">AI-Powered Finance</p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">Welcome back! Here's your financial overview.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              {headerActions}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container-responsive padding-responsive">
        {children}
      </main>
    </div>
  );
};

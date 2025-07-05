import { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";
import { BottomNavigation } from "./BottomNavigation";
import { PWAInstall } from "./PWAInstall";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  title: string;
  activeTab: string;
  headerActions?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export const MobileOptimizedLayout = ({
  children,
  title,
  activeTab,
  headerActions,
  showBackButton = false,
  onBack,
  className = ""
}: MobileOptimizedLayoutProps) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Mobile Layout (< 768px)
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden safe-area-top">
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
        
        {/* Main content with proper spacing for mobile */}
        <main className="pt-14 pb-20 min-h-screen">
          <div className="px-4 py-4 max-w-full">
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
      <div className={cn("min-h-screen bg-gray-50 overflow-x-hidden", className)}>
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
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
        
        <main className="px-6 py-6 max-w-full">
          {children}
        </main>
      </div>
    );
  }

  // Desktop Layout (>= 1024px) - Keep existing desktop behavior
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
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
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
};

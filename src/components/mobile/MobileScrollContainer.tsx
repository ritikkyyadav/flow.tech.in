
import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MobileScrollContainerProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
  autoScroll?: boolean;
  pullToRefresh?: boolean;
  onRefresh?: () => void;
}

export const MobileScrollContainer = ({
  children,
  className,
  maxHeight = "calc(100vh - 140px)",
  autoScroll = false,
  pullToRefresh = false,
  onRefresh
}: MobileScrollContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [children, autoScroll]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
        "touch-pan-y",
        className
      )}
      style={{ maxHeight }}
    >
      {pullToRefresh && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Pull to refresh
        </div>
      )}
      {children}
    </div>
  );
};

interface MobileListItemProps {
  children: ReactNode;
  onTap?: () => void;
  className?: string;
  interactive?: boolean;
}

export const MobileListItem = ({
  children,
  onTap,
  className,
  interactive = true
}: MobileListItemProps) => {
  return (
    <div
      onClick={onTap}
      className={cn(
        "p-4 border-b border-gray-100 min-h-[60px] flex items-center",
        interactive && onTap && "active:bg-gray-50 cursor-pointer touch-callout-none tap-highlight-transparent",
        className
      )}
    >
      {children}
    </div>
  );
};

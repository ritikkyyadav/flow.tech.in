
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  onTap?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const MobileCard = ({
  title,
  children,
  className,
  contentClassName,
  onTap,
  padding = 'md'
}: MobileCardProps) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <Card 
      className={cn(
        "shadow-sm border-gray-200 bg-white",
        onTap && "cursor-pointer active:scale-[0.98] transition-transform duration-150",
        className
      )}
      onClick={onTap}
    >
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(
        paddingClasses[padding],
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

interface MobileGridProps {
  children: ReactNode;
  cols?: 1 | 2;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileGrid = ({
  children,
  cols = 1,
  gap = 'md',
  className
}: MobileGridProps) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={cn(
      "grid",
      cols === 1 && "grid-cols-1",
      cols === 2 && "grid-cols-1 sm:grid-cols-2",
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

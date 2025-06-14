
import { ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TouchButtonProps extends ButtonProps {
  children: ReactNode;
  fullWidth?: boolean;
  touchSize?: 'sm' | 'md' | 'lg';
}

export const TouchButton = ({
  children,
  fullWidth = false,
  touchSize = 'md',
  className,
  ...props
}: TouchButtonProps) => {
  const sizeClasses = {
    sm: 'min-h-[40px] px-4 py-2',
    md: 'min-h-[44px] px-6 py-3',
    lg: 'min-h-[48px] px-8 py-4'
  };

  return (
    <Button
      className={cn(
        "active:scale-[0.98] transition-transform duration-150",
        sizeClasses[touchSize],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  className?: string;
}

export const FloatingActionButton = ({
  onClick,
  icon,
  className
}: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 w-14 h-14 bg-black text-white rounded-full",
        "flex items-center justify-center shadow-lg",
        "active:scale-95 transition-transform duration-150",
        "z-40 lg:hidden",
        className
      )}
    >
      {icon}
    </button>
  );
};


import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const MobileInput = ({
  label,
  error,
  fullWidth = true,
  className,
  ...props
}: MobileInputProps) => {
  return (
    <div className={cn("space-y-2", fullWidth && "w-full")}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      <Input
        className={cn(
          "min-h-[48px] text-base border-2 focus:border-blue-500 transition-colors",
          "touch-callout-none tap-highlight-transparent",
          error && "border-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface MobileTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const MobileTextarea = ({
  label,
  error,
  fullWidth = true,
  className,
  ...props
}: MobileTextareaProps) => {
  return (
    <div className={cn("space-y-2", fullWidth && "w-full")}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      <Textarea
        className={cn(
          "min-h-[120px] text-base border-2 focus:border-blue-500 transition-colors resize-none",
          "touch-callout-none tap-highlight-transparent",
          error && "border-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface MobileButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const MobileButton = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className
}: MobileButtonProps) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 touch-callout-none tap-highlight-transparent active:scale-[0.98]";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:from-blue-700 hover:to-orange-600 shadow-md",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    ghost: "text-gray-700 hover:bg-gray-100"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-[40px]",
    md: "px-6 py-3 text-base min-h-[48px]",
    lg: "px-8 py-4 text-lg min-h-[52px]"
  };

  return (
    <Button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

interface MobileFormGroupProps {
  children: ReactNode;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

export const MobileFormGroup = ({
  children,
  spacing = "md",
  className
}: MobileFormGroupProps) => {
  const spacingClasses = {
    sm: "space-y-3",
    md: "space-y-4",
    lg: "space-y-6"
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};

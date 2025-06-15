
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MobileFormProps {
  title?: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const MobileForm = ({ title, children, onSubmit, className }: MobileFormProps) => {
  return (
    <Card className={cn("shadow-sm border-gray-200", className)}>
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
      </CardContent>
    </Card>
  );
};

interface MobileFormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
}

export const MobileFormField = ({ label, children, required, error }: MobileFormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const MobileInput = ({ label, error, className, ...props }: MobileInputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      <Input
        className={cn(
          "h-12 text-base", // Larger height and font size for mobile
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const MobileTextarea = ({ label, error, className, ...props }: MobileTextareaProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      <Textarea
        className={cn(
          "min-h-[100px] text-base", // Larger height and font size for mobile
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

interface MobileSelectProps {
  label?: string;
  error?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: ReactNode;
}

export const MobileSelect = ({ 
  label, 
  error, 
  value, 
  onValueChange, 
  placeholder, 
  children 
}: MobileSelectProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(
          "h-12 text-base", // Larger height and font size for mobile
          error && "border-red-500"
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

interface MobileSubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const MobileSubmitButton = ({ 
  children, 
  loading, 
  disabled, 
  variant = "default" 
}: MobileSubmitButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      variant={variant}
      className="w-full h-12 text-base font-medium mt-6"
    >
      {loading ? "Processing..." : children}
    </Button>
  );
};


import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  validation: {
    isValid: boolean;
    strength: number;
    errors: string[];
  };
}

export const PasswordStrengthIndicator = ({ password, validation }: PasswordStrengthIndicatorProps) => {
  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 3) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return "Weak";
    if (strength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-600">Strength:</span>
        <div className="flex-1 h-2 bg-gray-200 rounded">
          <div
            className={`h-full rounded transition-all duration-300 ${getStrengthColor(validation.strength)}`}
            style={{ width: `${(validation.strength / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          validation.strength <= 1 ? "text-red-600" :
          validation.strength <= 3 ? "text-orange-600" : "text-green-600"
        }`}>
          {getStrengthText(validation.strength)}
        </span>
      </div>

      {/* Requirements List */}
      {password && (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {password.length >= 8 ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs ${password.length >= 8 ? "text-green-600" : "text-red-600"}`}>
              At least 8 characters
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/[A-Z]/.test(password) ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs ${/[A-Z]/.test(password) ? "text-green-600" : "text-red-600"}`}>
              One uppercase letter
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/[a-z]/.test(password) ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs ${/[a-z]/.test(password) ? "text-green-600" : "text-red-600"}`}>
              One lowercase letter
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/[0-9]/.test(password) ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs ${/[0-9]/.test(password) ? "text-green-600" : "text-red-600"}`}>
              One number
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : "text-red-600"}`}>
              One special character
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

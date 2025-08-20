import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MobileToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const MobileToggle: React.FC<MobileToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label || 'Toggle'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex items-center min-h-[44px] select-none',
        'rounded-full px-1 py-1 transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
        checked ? 'bg-gradient-to-r from-blue-600 to-orange-500' : 'bg-gray-200',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {label && (
        <span className={cn('mr-3 text-sm', checked ? 'text-white' : 'text-gray-700')}>{label}</span>
      )}
      <motion.div
        className={cn(
          'w-10 h-10 rounded-full bg-white shadow-md',
          'flex items-center justify-center'
        )}
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.span
          className={cn('block w-2.5 h-2.5 rounded-full', checked ? 'bg-orange-500' : 'bg-gray-400')}
          layout
        />
      </motion.div>
    </button>
  );
};

export default MobileToggle;

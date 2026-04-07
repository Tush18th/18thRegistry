import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            className="peer sr-only"
            {...props}
          />
          <div className={cn(
            "w-5 h-5 border-2 border-gray-700 rounded transition-all",
            "peer-checked:bg-primary peer-checked:border-primary",
            "group-hover:border-primary/50",
            className
          )}>
            <Check className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
          </div>
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

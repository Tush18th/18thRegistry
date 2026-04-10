import React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
};

import { cn } from '@/lib/utils';

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic';
  
  const variants = {
    success: 'bg-green-100/50 text-green-600 border border-green-200',
    warning: 'bg-yellow-100/50 text-yellow-600 border border-yellow-200',
    danger: 'bg-red-100/50 text-red-600 border border-red-200',
    info: 'bg-primary/10 text-primary border border-primary/20',
    default: 'bg-slate-100 text-slate-500 border border-slate-200',
  };

  const classes = cn(baseStyles, variants[variant], className);

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

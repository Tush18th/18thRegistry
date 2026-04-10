import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight uppercase rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95';
  
  const variants = {
    primary: 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/30',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    danger: 'bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600',
    ghost: 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50',
    glow: 'bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.02]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px] tracking-widest',
    md: 'px-6 py-3 text-xs tracking-widest',
    lg: 'px-10 py-4 text-sm tracking-widest',
  };

  const classes = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

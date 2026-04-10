import { cn } from '@/lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { glass?: boolean }> = ({ className = '', children, glass = false, ...props }) => {
  return (
    <div 
      className={cn(
        "rounded-[2.5rem] border transition-all duration-300",
        glass ? "glass" : "bg-card border-slate-100 shadow-premium",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={cn("px-8 py-6 pb-2", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => {
  return (
    <h3 className={cn("text-xl font-bold tracking-tight text-slate-900 uppercase italic", className)} {...props}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={cn("p-8", className)} {...props}>
      {children}
    </div>
  );
};

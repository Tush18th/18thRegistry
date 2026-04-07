import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Library, 
  Zap, 
  CheckCircle, 
  RefreshCw,
  Settings,
  ChevronRight,
  Box,
  Sparkles,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Module Library', href: '/library', icon: Library },
    { name: 'Grounded AI Gen', href: '/generator/ai', icon: Sparkles },
    { name: 'Boilerplate Gen', href: '/generator', icon: Box },
    { name: 'Ingestion Engine', href: '/ingestion', icon: RefreshCw },
  ];

  return (
    <aside className="w-72 flex-shrink-0 bg-surface border-r border-border flex flex-col hidden md:flex">
      <div className="h-20 flex items-center px-8 border-b border-border/50">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
          <Zap className="w-5 h-5 text-white fill-current" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">18th<span className="text-primary">Registry</span></span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                  : "text-gray-400 hover:bg-gray-100/5 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn(
                  "mr-3 w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                )} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border/50 bg-black/10">
        <div className="flex items-center justify-between group cursor-pointer">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 mr-3 border border-white/10 shadow-inner"></div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Admin User</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">SuperAdmin</p>
            </div>
          </div>
          <Settings className="w-5 h-5 text-gray-600 group-hover:text-white transition-all transform group-hover:rotate-45" />
        </div>
      </div>
    </aside>
  );
};

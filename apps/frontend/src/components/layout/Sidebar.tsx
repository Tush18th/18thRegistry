import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Library, 
  Zap, 
  RefreshCw,
  Box,
  Sparkles,
  Users,
  History,
  LogOut,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Module Library', href: '/library', icon: Library },
    { name: 'Sandbox Environments', href: '/sandboxes', icon: Terminal },
    { name: 'Grounded AI Gen', href: '/generator/ai', icon: Sparkles },
    { name: 'Boilerplate Gen', href: '/generator', icon: Box },
    { name: 'Ingestion Engine', href: '/ingestion', icon: RefreshCw },
  ];

  const adminItems = [
    { name: 'User Management', href: '/admin/users', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <aside className="w-80 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col hidden md:flex shadow-premium">
      <div className="h-20 flex items-center px-10 border-b border-slate-50">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-primary/20">
          <Zap className="w-6 h-6 text-white fill-current" />
        </div>
        <span className="text-2xl font-black text-slate-950 tracking-tighter uppercase font-heading">18th<span className="text-primary">Registry</span></span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-10 px-6 space-y-2">
        <div className="px-4 mb-4 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 italic">Navigation Protocol</div>
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "flex items-center justify-between px-5 py-3.5 text-xs font-bold rounded-2xl transition-all duration-300 group",
              isActive(item.href) 
                ? "bg-slate-950 text-white shadow-xl shadow-slate-950/20 active:scale-95" 
                : "text-slate-500 hover:bg-slate-50 hover:text-primary"
            )}
          >
            <div className="flex items-center">
              <item.icon className={cn(
                "mr-4 w-5 h-5 transition-colors",
                isActive(item.href) ? "text-primary" : "text-slate-300 group-hover:text-primary"
              )} />
              <span className="tracking-tight uppercase font-heading italic">{item.name}</span>
            </div>
            {isActive(item.href) && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </Link>
        ))}

        {/* Administrative Section */}
        {(hasRole([UserRole.SUPER_ADMIN, UserRole.ADMIN])) && (
          <div className="pt-8 mt-8 border-t border-slate-50">
            <p className="px-4 mb-4 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 italic">Governance Control</p>
            {adminItems.map((item) => hasRole(item.roles) && (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex items-center justify-between px-5 py-3.5 text-xs font-bold rounded-2xl transition-all duration-300 group",
                  isActive(item.href) 
                    ? "bg-slate-950 text-white shadow-xl shadow-slate-950/20 active:scale-95" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <div className="flex items-center">
                  <item.icon className={cn(
                    "mr-4 w-5 h-5 transition-colors",
                    isActive(item.href) ? "text-primary" : "text-slate-300 group-hover:text-primary"
                  )} />
                  <span className="tracking-tight uppercase font-heading italic">{item.name}</span>
                </div>
                {isActive(item.href) && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-8 border-t border-slate-50 bg-slate-50/30">
        <div className="flex items-center justify-between group">
          <Link href="/profile" className="flex items-center flex-1 cursor-pointer overflow-hidden">
            <div className="w-11 h-11 rounded-[14px] bg-slate-900 mr-4 border border-white shadow-md flex items-center justify-center flex-shrink-0">
               <span className="text-white font-black text-xs font-heading">{user?.fullName?.charAt(0) || 'U'}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-black text-slate-950 group-hover:text-primary transition-colors truncate uppercase font-heading tracking-tight italic">{user?.fullName || 'Guest User'}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black truncate italic leading-none">{user?.role?.replace('_', ' ') || 'No Role'}</p>
            </div>
          </Link>
          <button 
            onClick={() => logout()}
            className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-white border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm flex-shrink-0"
            title="Logout Device"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

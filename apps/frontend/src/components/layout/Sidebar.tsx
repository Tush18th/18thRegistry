import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Library, 
  Zap, 
  RefreshCw,
  Settings,
  ChevronRight,
  Box,
  Sparkles,
  Users,
  ShieldCheck,
  History,
  LogOut,
  UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Module Library', href: '/library', icon: Library },
    { name: 'Grounded AI Gen', href: '/generator/ai', icon: Sparkles },
    { name: 'Boilerplate Gen', href: '/generator', icon: Box },
    { name: 'Ingestion Engine', href: '/ingestion', icon: RefreshCw },
  ];

  const adminItems = [
    { name: 'User Management', href: '/admin/users', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { name: 'Audit Logs', href: '/admin/audit', icon: History, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
          <Zap className="w-5 h-5 text-white fill-current" />
        </div>
        <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">18th<span className="text-primary tracking-normal not-italic">Registry</span></span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-xl transition-all duration-200 group",
              isActive(item.href) 
                ? "bg-primary text-white shadow-lg shadow-primary/25" 
                : "text-slate-500 hover:bg-slate-50 hover:text-primary"
            )}
          >
            <div className="flex items-center">
              <item.icon className={cn(
                "mr-3 w-5 h-5 transition-colors",
                isActive(item.href) ? "text-white" : "text-slate-400 group-hover:text-primary"
              )} />
              {item.name}
            </div>
            {isActive(item.href) && <ChevronRight className="w-4 h-4" />}
          </Link>
        ))}

        {/* Administrative Section */}
        {(hasRole([UserRole.SUPER_ADMIN, UserRole.ADMIN])) && (
          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="px-4 mb-4 text-[10px] uppercase tracking-widest font-black text-slate-400 italic">System Ops</p>
            {adminItems.map((item) => hasRole(item.roles) && (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-xl transition-all duration-200 group",
                  isActive(item.href) 
                    ? "bg-primary text-white shadow-lg shadow-primary/25" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <div className="flex items-center">
                  <item.icon className={cn(
                    "mr-3 w-5 h-5 transition-colors",
                    isActive(item.href) ? "text-white" : "text-slate-400 group-hover:text-primary"
                  )} />
                  {item.name}
                </div>
                {isActive(item.href) && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-gray-100 bg-slate-50/50">
        <div className="flex items-center justify-between group">
          <Link href="/profile" className="flex items-center flex-1 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 mr-3 border border-white shadow-md flex items-center justify-center">
               <span className="text-white font-bold text-xs">{user?.fullName?.charAt(0) || 'U'}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{user?.fullName || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black truncate italic">{user?.role?.replace('_', ' ') || 'No Role'}</p>
            </div>
          </Link>
          <button 
            onClick={() => logout()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
            title="Logout Device"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

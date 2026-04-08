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
    <aside className="w-72 flex-shrink-0 bg-surface border-r border-border flex flex-col hidden md:flex">
      <div className="h-20 flex items-center px-8 border-b border-border/50">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
          <Zap className="w-5 h-5 text-white fill-current" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">18th<span className="text-primary">Registry</span></span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 text-black">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group",
              isActive(item.href) 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                : "text-gray-400 hover:bg-gray-100/5 hover:text-white"
            )}
          >
            <div className="flex items-center">
              <item.icon className={cn(
                "mr-3 w-5 h-5 transition-colors",
                isActive(item.href) ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
              )} />
              {item.name}
            </div>
            {isActive(item.href) && <ChevronRight className="w-4 h-4" />}
          </Link>
        ))}

        {/* Administrative Section */}
        {(hasRole([UserRole.SUPER_ADMIN, UserRole.ADMIN])) && (
          <div className="pt-6 mt-6 border-t border-border/30">
            <p className="px-4 mb-4 text-[10px] uppercase tracking-widest font-black text-gray-600">Administration</p>
            {adminItems.map((item) => hasRole(item.roles) && (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group",
                  isActive(item.href) 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                    : "text-gray-400 hover:bg-gray-100/5 hover:text-white"
                )}
              >
                <div className="flex items-center">
                  <item.icon className={cn(
                    "mr-3 w-5 h-5 transition-colors",
                    isActive(item.href) ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                  )} />
                  {item.name}
                </div>
                {isActive(item.href) && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-border/50 bg-black/10">
        <div className="flex items-center justify-between group">
          <Link href="/profile" className="flex items-center flex-1 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 mr-3 border border-white/10 shadow-inner flex items-center justify-center">
               <span className="text-white font-bold text-xs">{user?.fullName?.charAt(0) || 'U'}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{user?.fullName || 'Guest User'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black truncate">{user?.role?.replace('_', ' ') || 'No Role'}</p>
            </div>
          </Link>
          <button 
            onClick={() => logout()}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-all ml-2"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

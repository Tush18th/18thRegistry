import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Search, Bell, Plus, Activity } from 'lucide-react';

export const TopNavigation: React.FC = () => {
  return (
    <header className="h-20 flex items-center justify-between px-10 bg-white/70 backdrop-blur-xl border-b border-slate-50 sticky top-0 z-40 w-full transition-all">
      <div className="flex-1 max-w-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
           <Activity className="w-4 h-4 text-green-500 animate-pulse" />
           <span>Environment: Standardized</span>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="h-8 w-px bg-slate-100"></div>
        <Link href="/ingestion">
          <Button variant="primary" size="sm" className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 w-4 h-4" /> Add Protocol
          </Button>
        </Link>
      </div>
    </header>
  );
};

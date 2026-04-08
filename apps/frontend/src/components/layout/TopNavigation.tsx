import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const TopNavigation: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10 w-full shadow-sm">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-400 group-focus-within:text-primary transition-colors">🔍</span>
          </span>
          <Input 
            placeholder="Search Registry Platform (Cmd+K)" 
            className="pl-10 bg-slate-50 border-gray-200 focus:ring-primary/20 focus:border-primary w-full max-w-md h-10 rounded-xl"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl">
          <span className="text-lg">🔔</span>
        </Button>
        <div className="h-6 w-px bg-gray-100 mx-1"></div>
        <Button variant="primary" size="sm" className="bg-primary hover:bg-primaryHover text-white font-bold rounded-xl shadow-md shadow-primary/20 h-10 px-5">
           Add Module
        </Button>
      </div>
    </header>
  );
};

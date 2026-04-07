import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const TopNavigation: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border sticky top-0 z-10 w-full">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-400">🔍</span>
          </span>
          <Input 
            placeholder="Search modules, schemas, docs... (Cmd+K)" 
            className="pl-10 bg-surface border-border focus:ring-primary w-full max-w-md"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <span className="text-lg">🔔</span>
        </Button>
        <Button variant="primary" size="sm">
          <span className="mr-2">✨</span>
          New Module
        </Button>
      </div>
    </header>
  );
};

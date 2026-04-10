import React from 'react';
import Head from 'next/head';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no user, render without sidebar/topnav (for landing page/public pages)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground tracking-tight selection:bg-primary/20 font-body">
      <Head>
        <title>18th Registry | Modular Intelligence</title>
        <meta name="theme-color" content="#fdfdfd" />
      </Head>
      <Sidebar />
      <div className="flex flex-col flex-1 w-0 overflow-hidden bg-background">
        <TopNavigation />
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none scroll-smooth">
          <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

import React from 'react';
import Head from 'next/head';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground dark">
      <Head>
        <title>18th Digitech | Module Registry</title>
        <meta name="theme-color" content="#0f111a" />
      </Head>
      <Sidebar />
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <TopNavigation />
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

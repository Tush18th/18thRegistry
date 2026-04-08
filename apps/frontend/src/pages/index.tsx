import React, { useState } from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import { 
  Plus, 
  Search, 
  Library, 
  Zap, 
  Package, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/layout/LandingPage';

export default function RegistryDashboard() {
  const { user, loading } = useAuth();
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery('registry-stats', async () => {
    const res = await api.get('/modules/stats');
    return res.data;
  }, { enabled: !!user });

  const { data: featuredModules } = useQuery(['featured-modules', search], async () => {
    const res = await api.get('/modules/search', { params: { query: search } });
    return res.data;
  }, { enabled: !!user });

  if (loading) return null;

  if (!user) {
    return <LandingPage />;
  }

  return (
    <>
      <Head>
        <title>Registry Dashboard | 18th Module Registry</title>
      </Head>

      <div className="space-y-10 pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
           <div className="relative z-10 max-w-2xl">
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 mb-6 font-black uppercase tracking-widest text-[10px] italic">Operational Hub</Badge>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 italic leading-tight">
                GROUNDED AI <br />
                <span className="text-primary tracking-normal not-italic">MODULE REGISTRY.</span>
              </h1>
              <p className="text-slate-500 text-lg mb-8 font-medium leading-relaxed">
                The organization's central nervous system for reusable Magento 2 code. 
                Search, adapt, and generate validated modules with local architectural context.
              </p>
              
              <div className="flex flex-wrap gap-4">
                 <Link href="/generator/ai">
                    <Button size="lg" className="h-14 px-8 text-white font-black uppercase gap-2 bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/10 rounded-xl">
                       <Sparkles className="w-5 h-5" /> Start AI Generation
                    </Button>
                 </Link>
                 <Link href="/library">
                    <Button size="lg" variant="secondary" className="h-14 px-8 font-black uppercase gap-2 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl">
                       <Library className="w-5 h-5" /> Browse Library
                    </Button>
                 </Link>
              </div>
           </div>
           
           <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
              <Zap className="w-full h-full text-primary blur-3xl animate-pulse" />
           </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <StatCard icon={<Package className="text-blue-500" />} label="Verified Modules" value={stats?.approved || 0} color="blue" />
           <StatCard icon={<BarChart3 className="text-purple-500" />} label="Avg. Generation Time" value="45s" color="purple" />
           <StatCard icon={<ShieldCheck className="text-green-500" />} label="Validation Passed" value="100%" color="green" />
           <StatCard icon={<Plus className="text-orange-500" />} label="Drafts Pending" value={stats?.pending || 0} color="orange" />
        </div>

        {/* Discovery & Search */}
        <div className="space-y-6">
           <div className="flex justify-between items-end">
              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Discovery Index</h2>
                 <p className="text-sm text-slate-500 font-medium italic">Recently updated modules and internal reference patterns.</p>
              </div>
              <div className="relative w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input 
                   placeholder="Quick search modules..." 
                   className="pl-10 h-10 bg-white border-slate-200 focus:ring-primary/20 focus:border-primary rounded-xl"
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredModules?.slice(0, 3).map((mod: any) => (
                <Card key={mod.id} className="hover:border-primary/50 transition-all cursor-pointer group bg-white border-slate-100 shadow-sm hover:shadow-xl rounded-[1.5rem]">
                  <CardContent className="p-6 space-y-4">
                     <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                           <Package className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <Badge variant="default" className="text-[10px] font-black tracking-widest uppercase text-slate-400 bg-slate-50 border-slate-100 italic">{mod.vendor}</Badge>
                     </div>
                     
                     <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">{mod.name}</h3>
                        <p className="text-xs text-slate-400 font-mono truncate">{mod.namespace}</p>
                     </div>

                     <p className="text-sm text-slate-500 line-clamp-2 h-10 leading-snug font-medium italic">
                       {mod.description || 'No description provided for this verified reference module.'}
                     </p>

                     <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4 text-green-500" />
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider italic">Verified</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                     </div>
                  </CardContent>
                </Card>
              ))}
              
              <Link href="/library" className="group">
                 <Card className="h-full border-dashed border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center rounded-[1.5rem]">
                    <CardContent className="text-center space-y-2 p-6">
                       <Plus className="w-8 h-8 text-slate-300 mx-auto group-hover:text-primary transition-colors" />
                       <span className="text-sm font-bold text-slate-400 block group-hover:text-primary transition-colors">Explore All Modules</span>
                    </CardContent>
                 </Card>
              </Link>
           </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group rounded-2xl">
      <CardContent className="p-6 flex items-center gap-6">
        <div className={`p-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{label}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
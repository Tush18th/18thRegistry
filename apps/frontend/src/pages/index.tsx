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

      <div className="space-y-12 pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-10 md:p-16 shadow-2xl border border-slate-900">
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
           
           <div className="relative z-10 max-w-2xl space-y-8">
              <Badge variant="info" className="bg-primary/20 text-indigo-400 border-primary/30">System Status: Operational</Badge>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight font-heading uppercase italic">
                Architectural <br />
                <span className="text-primary not-italic">Governance.</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                The organization's definitive registry for modular codebases. 
                Search, verify, and generate validated Magento 2 solutions with grounded context.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                 <Link href="/generator/ai">
                    <Button variant="glow" size="lg">
                       <Sparkles className="w-5 h-5 mr-2" /> Start AI Gen
                    </Button>
                 </Link>
                 <Link href="/library">
                    <Button variant="secondary" size="lg" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                       <Library className="w-5 h-5 mr-2" /> Library
                    </Button>
                 </Link>
              </div>
           </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <StatCard icon={<Package className="text-indigo-500" />} label="Verified Modules" value={stats?.approved || 0} />
           <StatCard icon={<BarChart3 className="text-indigo-500" />} label="Avg. Generation" value="45s" />
           <StatCard icon={<ShieldCheck className="text-green-500" />} label="Security Compliance" value="100%" />
           <StatCard icon={<Plus className="text-orange-500" />} label="Drafts Pending" value={stats?.pending || 0} />
        </div>

        {/* Discovery & Search */}
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-1">
                 <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter font-heading italic">Discovery Index</h2>
                 <p className="text-sm text-slate-500 font-medium italic">Recently verified modules and architectural references.</p>
              </div>
              <div className="relative w-full md:w-96 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                 <Input 
                   placeholder="Quick search modules..." 
                   className="pl-12 h-14 bg-white"
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredModules?.slice(0, 3).map((mod: any) => (
                <Card key={mod.id} className="group hover:border-primary/30 hover:shadow-premium-hover cursor-pointer p-0">
                  <div className="p-8 space-y-6">
                     <div className="flex justify-between items-start">
                        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                           <Package className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <Badge variant="default">{mod.vendor}</Badge>
                     </div>
                     
                     <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-950 group-hover:text-primary transition-colors uppercase tracking-tight font-heading">{mod.name}</h3>
                        <p className="text-xs text-slate-400 font-mono italic">{mod.namespace}</p>
                     </div>

                     <p className="text-sm text-slate-500 line-clamp-2 h-10 leading-snug font-medium italic">
                       {mod.description || 'Verified reference module for internal organizational reuse.'}
                     </p>
                  </div>

                  <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between rounded-b-[2.5rem] group-hover:bg-primary/5 transition-all">
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Verified</span>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              ))}
              
              <Link href="/library" className="group">
                 <Card className="h-full border-dashed border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-3">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-all">
                          <Plus className="w-6 h-6 text-slate-300 group-hover:text-white" />
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors italic">Explore Complete Library</span>
                    </div>
                 </Card>
              </Link>
           </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="hover:shadow-premium-hover transition-all group p-8">
      <div className="flex items-center gap-6">
        <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-primary/10 transition-all">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{label}</p>
          <p className="text-3xl font-black text-slate-950 tracking-tighter font-heading">{value}</p>
        </div>
      </div>
    </Card>
  );
}
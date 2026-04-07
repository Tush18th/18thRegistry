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

export default function RegistryDashboard() {
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery('registry-stats', async () => {
    const res = await api.get('/modules/stats');
    return res.data;
  });

  const { data: featuredModules } = useQuery(['featured-modules', search], async () => {
    const res = await api.get('/modules/search', { params: { query: search } });
    return res.data;
  });

  return (
    <>
      <Head>
        <title>Registry Dashboard | 18th Module Registry</title>
      </Head>

      <div className="space-y-10 pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-primary/10 border border-gray-800 p-8 md:p-12 shadow-2xl">
           <div className="relative z-10 max-w-2xl">
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 mb-6 font-black uppercase tracking-widest text-[10px]">Production Registry</Badge>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 italic leading-tight">
                GROUNDED AI <br />
                <span className="text-primary tracking-normal">MODULE REGISTRY.</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 font-medium leading-relaxed">
                The organization's central nervous system for reusable Magento 2 code. 
                Search, adapt, and generate validated modules with local architectural context.
              </p>
              
              <div className="flex flex-wrap gap-4">
                 <Link href="/generator/ai">
                    <Button size="lg" className="h-14 px-8 text-black font-black uppercase gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                       <Sparkles className="w-5 h-5" /> Start AI Generation
                    </Button>
                 </Link>
                 <Link href="/library">
                    <Button size="lg" variant="secondary" className="h-14 px-8 font-black uppercase gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800">
                       <Library className="w-5 h-5" /> Browse Official Library
                    </Button>
                 </Link>
              </div>
           </div>
           
           <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none group">
              <Zap className="w-full h-full text-primary/30 blur-3xl" />
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
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Discovery Index</h2>
                 <p className="text-sm text-gray-400 font-medium">Recently updated modules and internal reference patterns.</p>
              </div>
              <div className="relative w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                 <Input 
                   placeholder="Quick search modules..." 
                   className="pl-10 h-10 bg-gray-900 border-gray-800"
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredModules?.slice(0, 3).map((mod: any) => (
                <Card key={mod.id} className="hover:border-primary/50 transition-all cursor-pointer group bg-gray-900/40">
                  <CardContent className="p-6 space-y-4">
                     <div className="flex justify-between items-start">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-black transition-colors">
                           <Package className="w-6 h-6 text-primary group-hover:text-black" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase text-gray-500">{mod.vendor}</Badge>
                     </div>
                     
                     <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors uppercase">{mod.name}</h3>
                        <p className="text-xs text-gray-500 font-mono truncate">{mod.namespace}</p>
                     </div>

                     <p className="text-sm text-gray-400 line-clamp-2 h-10 leading-snug">
                       {mod.description || 'No description provided for this verified reference module.'}
                     </p>

                     <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4 text-green-500" />
                           <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Verified</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-primary transition-colors" />
                     </div>
                  </CardContent>
                </Card>
              ))}
              
              <Link href="/library" className="group">
                 <Card className="h-full border-dashed border-gray-800 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center">
                    <CardContent className="text-center space-y-2 p-6">
                       <Plus className="w-8 h-8 text-gray-700 mx-auto group-hover:text-primary transition-colors" />
                       <span className="text-sm font-bold text-gray-600 block group-hover:text-primary transition-colors">Explore All Modules</span>
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
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden group">
      <CardContent className="p-6 flex items-center gap-6">
        <div className={`p-4 rounded-2xl bg-gray-900 border border-gray-800 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
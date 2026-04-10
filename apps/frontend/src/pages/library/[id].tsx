import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Package, 
  ShieldCheck, 
  Globe, 
  Clock, 
  Code2, 
  Download,
  Terminal,
  ChevronRight,
  Play
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { CompatibilityPanel } from '@/components/library/CompatibilityPanel';
import { StackSelectorModal } from '@/components/sandbox/StackSelectorModal';
import Link from 'next/link';

export default function ModuleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);

  const { data: mod, isLoading } = useQuery(['module-detail', id], async () => {
    const res = await api.get(`/modules/${id}`);
    return res.data;
  }, { enabled: !!id });

  if (isLoading || !id) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-slate-50 rounded-[2.5rem]" />
          <div className="h-96 bg-slate-50 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="text-center py-24 space-y-4">
        <Package className="w-16 h-16 text-slate-200 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Module Not Found</h2>
        <Link href="/library">
          <Button variant="secondary" size="lg">Back to Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{mod.name} | 18th Module Registry</title>
      </Head>

      <div className="space-y-8 pb-24">
        <header className="space-y-4">
          <Link href="/library">
            <Button variant="ghost" size="sm" className="gap-2 p-0 hover:bg-transparent text-slate-400 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Library
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <Package className="w-8 h-8 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <Badge variant="default" className="bg-slate-50 text-slate-400 border-slate-100 font-black uppercase text-[10px] tracking-widest italic">{mod.vendor}</Badge>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{mod.name}</h1>
                 </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/library/clone/${mod.id}`}>
                 <Button variant="secondary" size="lg" className="h-14 px-8 font-black uppercase tracking-tight italic gap-2 rounded-2xl border-slate-200">
                   <Download className="w-5 h-5" /> Clone Module
                 </Button>
              </Link>
              <Button 
                onClick={() => setIsLaunchModalOpen(true)}
                size="lg" 
                className="h-14 px-8 bg-slate-900 text-white font-black uppercase tracking-tight italic gap-2 rounded-2xl shadow-xl shadow-slate-900/10"
              >
                <Play className="w-5 h-5 fill-current" /> Test in Sandbox
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="bg-white border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] rounded-[2.5rem] overflow-hidden">
               <CardContent className="p-10 space-y-10">
                  <section className="space-y-4">
                     <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] italic flex items-center gap-3">
                        <Globe className="w-4 h-4" /> Architectural Context
                     </h2>
                     <p className="text-lg text-slate-600 font-medium italic leading-relaxed">
                       {mod.description || 'This module provides standardized Magento 2 functionality as an internal reference pattern. No detailed description is available at this time.'}
                     </p>
                  </section>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Namespace</span>
                        <p className="font-mono text-sm text-slate-900 truncate">{mod.namespace}</p>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Current Version</span>
                        <p className="font-bold text-slate-900 tracking-tight italic">{mod.version}</p>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Last Synced</span>
                        <p className="text-sm font-medium text-slate-500 italic flex items-center gap-2">
                           <Clock className="w-3 h-3" /> {new Date(mod.createdAt).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <section className="space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider italic flex items-center gap-3">
                     <Code2 className="w-5 h-5 text-primary" /> Core Components
                  </h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-default flex items-center gap-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Terminal className="w-5 h-5" />
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900 uppercase italic">Registration</p>
                        <p className="text-[10px] text-slate-400 font-medium font-mono">registration.php</p>
                     </div>
                  </div>
                  <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-default flex items-center gap-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Globe className="w-5 h-5" />
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900 uppercase italic">API Services</p>
                        <p className="text-[10px] text-slate-400 font-medium font-mono">etc/webapi.xml</p>
                     </div>
                  </div>
               </div>
            </section>
          </div>

          {/* Sidebar / Analysis */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] italic flex items-center gap-3 px-2">
               Grounding Engine
            </h2>
            <CompatibilityPanel moduleId={mod.id} />
            
            <Card className="bg-slate-900 text-white rounded-[2rem] shadow-xl overflow-hidden group">
               <CardContent className="p-8 space-y-6">
                  <div className="p-3 bg-white/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                     <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-lg font-black uppercase italic tracking-tight">Security Audit</h3>
                     <p className="text-xs text-slate-400 font-medium italic leading-relaxed">All registry modules undergo structural integrity checks and security vulnerability scanning prior to being categorized as verified.</p>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <StackSelectorModal 
        isOpen={isLaunchModalOpen} 
        onClose={() => setIsLaunchModalOpen(false)} 
        moduleId={mod.id}
      /> 
    </>
  );
}

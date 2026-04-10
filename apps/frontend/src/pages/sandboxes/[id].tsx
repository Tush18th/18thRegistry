import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, 
  Terminal, 
  Activity, 
  ExternalLink, 
  Trash2, 
  Clock, 
  RotateCw,
  MoreVertical,
  Brain,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSandboxSession, useTerminateSandbox } from '@/hooks/use-sandbox';
import { SandboxStatus } from '@/types/sandbox';
import { StageStepper } from '@/components/sandbox/StageStepper';
import { LogViewer } from '@/components/sandbox/LogViewer';
import { ValidationDashboard } from '@/components/sandbox/ValidationDashboard';
import { TeardownBanner } from '@/components/sandbox/TeardownBanner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SandboxSessionPage() {
  const router = useRouter();
  const { id } = router.query;
  const terminateSandbox = useTerminateSandbox();

  // Polling logic: fast polling during setup, slower once running or when failed
  const { data, isLoading, refetch } = useSandboxSession(id as string, {
    enabled: !!id,
    refetchInterval: 5000, // Static polling for MVP reliability in React Query v3
  });

  const handleTerminate = async () => {
    if (!id || !confirm('Are you sure you want to destroy this sandbox session? All runtime data will be lost.')) return;
    await terminateSandbox.mutateAsync(id as string);
  };

  if (isLoading || !id) {
    return (
      <div className="space-y-8 animate-pulse pt-10">
        <div className="h-12 bg-slate-50 rounded-2xl w-1/3 mx-auto" />
        <div className="h-64 bg-slate-50 rounded-[2.5rem]" />
      </div>
    );
  }

  const session = data?.session;
  const events = data?.events || [];

  if (!session) return <div>Session not found</div>;

  const isActive = session.status !== SandboxStatus.TERMINATED && session.status !== SandboxStatus.FAILED;
  const isReady = session.status === SandboxStatus.RUNNING || session.status === SandboxStatus.AWAITING_APPROVAL;

  return (
    <>
      <Head>
        <title>Sandbox: {id} | 18th Module Registry</title>
      </Head>

      <div className="space-y-8 pb-24">
        {session && (
           <TeardownBanner 
              sessionId={session.id} 
              status={session.status} 
              expiresAt={session.expiresAt} 
           />
        )}

        {/* Navigation & Actions */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <Link href="/library">
                 <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all hover:shadow-md">
                    <ArrowLeft className="w-5 h-5" />
                 </button>
              </Link>
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Sandbox Instance</h1>
                    <Badge variant={isActive ? 'info' : 'default'} className="font-black italic uppercase text-[10px] tracking-widest px-3 py-1">
                       {session.status}
                    </Badge>
                 </div>
                 <p className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-widest">SID: {session.id}</p>
              </div>
           </div>

           <div className="flex items-center gap-3">
              {isReady && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                   <Clock className="w-4 h-4 text-slate-400" />
                   <span className="text-xs font-black uppercase text-slate-600 italic tracking-tight">Expiring in 42m</span>
                </div>
              )}
              {isActive && (
                <Button 
                   onClick={handleTerminate}
                   variant="danger" 
                   className="h-12 px-6 rounded-2xl font-black uppercase italic gap-2 shadow-xl shadow-red-500/10"
                   disabled={terminateSandbox.isLoading}
                >
                   <Trash2 className="w-4 h-4" /> Destroy Session
                </Button>
              )}
              <Button variant="secondary" className="h-12 w-12 p-0 rounded-2xl border-slate-100">
                 <RotateCw className="w-4 h-4 text-slate-400" onClick={() => refetch()} />
              </Button>
           </div>
        </header>

        {/* Status Stepper */}
        <div className="bg-white border border-slate-100 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] overflow-hidden">
           <StageStepper currentStatus={session.status} />
        </div>

        {/* Content Tabs/Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Primary Logic Feed */}
           <div className="lg:col-span-8 space-y-10">
              {session.status === SandboxStatus.FAILED ? (
                <div className="p-12 bg-red-50 border-2 border-red-100 rounded-[2.5rem] space-y-4 text-center">
                   <div className="w-20 h-20 bg-red-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                      <Trash2 className="w-10 h-10" />
                   </div>
                   <h2 className="text-3xl font-black text-red-600 tracking-tight uppercase italic">Orchestration Failed</h2>
                   <div className="bg-white/50 border border-red-200 p-6 rounded-3xl space-y-3">
                      <div className="flex items-center gap-2 text-red-500 font-black uppercase italic text-xs tracking-widest">
                         <Brain className="w-4 h-4" /> AI Troubleshooter Insight
                      </div>
                      <p className="text-slate-700 font-medium italic text-left leading-relaxed">
                         {session.remediationSuggestion || 'An unknown error occurred during the provisioning phase. The AI is currently analyzing logs...'}
                      </p>
                   </div>
                   <div className="pt-4 flex justify-center gap-4">
                      <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700 rounded-2xl px-8 h-12 uppercase font-black italic">Retry Pipeline</Button>
                      <Link href={`/library/${session.moduleId}`}>
                        <Button variant="secondary" className="rounded-2xl px-8 h-12 uppercase font-black italic">Back to Module</Button>
                      </Link>
                   </div>
                </div>
              ) : isReady ? (
                <ValidationDashboard 
                   isLoading={session.status === SandboxStatus.VALIDATING}
                   results={(session as any).validationResults} 
                />
              ) : (
                <div className="space-y-6">
                   <div className="flex items-center justify-between px-2">
                       <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-3">
                          <Activity className="w-5 h-5 text-primary" /> Live Logic Execution
                       </h2>
                   </div>
                   <LogViewer events={events} isStreaming={isActive} />
                </div>
              )}
           </div>

           {/* Side Details / Specs */}
           <div className="lg:col-span-4 space-y-8">
              <section className="space-y-4">
                 <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] italic px-2">Environment Spec</h2>
                 <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Magento</span>
                          <span className="font-bold text-slate-900 italic">{session.stackProfile?.magentoVersion || '2.x'}</span>
                       </div>
                       <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">PHP Engine</span>
                          <span className="font-bold text-slate-900 italic">{session.stackProfile?.phpVersion || '8.x'}</span>
                       </div>
                       <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Database</span>
                          <span className="font-bold text-slate-900 italic">MySQL 8.0</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Auth Mode</span>
                          <Badge variant="success" className="font-black italic text-[9px]">JWT Secure</Badge>
                       </div>
                    </div>
                 </div>
              </section>

              <section className="space-y-4">
                 <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] italic px-2">Sandbox Policy</h2>
                 <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 text-xs font-medium italic text-slate-500 leading-relaxed">
                    <p>Ephemeral environments are automatically destroyed once the TTL reaches zero. All data within the database and media folder will be purged.</p>
                    <p>Administrative accounts have read-only access to runtime logs for system auditing and security monitoring.</p>
                 </div>
              </section>

              {isActive && !isReady && (
                <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2rem] space-y-4 animate-pulse">
                   <div className="flex items-center gap-3">
                      <RotateCw className="w-5 h-5 text-primary animate-spin" />
                      <h3 className="text-sm font-black uppercase text-primary italic">Provisioning...</h3>
                   </div>
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight leading-relaxed">The orchestration engine is currently preparing your containerized Magento environment. This usually takes 60-90 seconds.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </>
  );
}

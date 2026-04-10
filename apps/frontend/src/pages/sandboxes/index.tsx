import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  Server,
  Play,
  Trash2,
  Clock,
  Activity,
  Terminal,
  CheckCircle,
  XCircle,
  Loader,
  RotateCw,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SandboxSession, SandboxStatus } from '@/types/sandbox';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string; icon: React.FC<any>; pulse?: boolean }> = {
  [SandboxStatus.REQUESTED]:             { label: 'Requested',      color: 'bg-slate-100 text-slate-600',    icon: Clock },
  [SandboxStatus.ANALYZING]:             { label: 'Analyzing',      color: 'bg-blue-50 text-blue-600',       icon: Activity, pulse: true },
  [SandboxStatus.AWAITING_CONFIRMATION]: { label: 'Awaiting Conf.', color: 'bg-yellow-50 text-yellow-600',  icon: AlertTriangle },
  [SandboxStatus.PROVISIONING]:          { label: 'Provisioning',   color: 'bg-indigo-50 text-indigo-600',   icon: Loader, pulse: true },
  [SandboxStatus.BOOTSTRAPPING]:         { label: 'Bootstrapping',  color: 'bg-indigo-50 text-indigo-600',   icon: Loader, pulse: true },
  [SandboxStatus.INSTALLING]:            { label: 'Installing',     color: 'bg-indigo-50 text-indigo-600',   icon: Loader, pulse: true },
  [SandboxStatus.VALIDATING]:            { label: 'Validating',     color: 'bg-purple-50 text-purple-600',   icon: Activity, pulse: true },
  [SandboxStatus.RUNNING]:               { label: 'Running',        color: 'bg-green-50 text-green-600',     icon: CheckCircle },
  [SandboxStatus.AWAITING_APPROVAL]:     { label: 'Needs Approval', color: 'bg-orange-50 text-orange-600',  icon: AlertTriangle, pulse: true },
  [SandboxStatus.FAILED]:                { label: 'Failed',         color: 'bg-red-50 text-red-600',         icon: XCircle },
  [SandboxStatus.TERMINATING]:           { label: 'Terminating',    color: 'bg-slate-100 text-slate-500',    icon: Loader, pulse: true },
  [SandboxStatus.TERMINATED]:            { label: 'Terminated',     color: 'bg-slate-50 text-slate-400',     icon: Trash2 },
};

export default function SandboxesPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'terminated'>('active');

  const { data: sessions, isLoading, refetch, isFetching } = useQuery<SandboxSession[]>(
    ['user-sandboxes'],
    async () => {
      const res = await api.get('/sandbox');
      return res.data;
    },
    { refetchInterval: 10000 }
  );

  const filteredSessions = sessions?.filter((s) => {
    if (filter === 'active') return s.status !== SandboxStatus.TERMINATED && s.status !== SandboxStatus.FAILED;
    if (filter === 'terminated') return s.status === SandboxStatus.TERMINATED || s.status === SandboxStatus.FAILED;
    return true;
  });

  const activeCount = sessions?.filter((s) => s.status !== SandboxStatus.TERMINATED && s.status !== SandboxStatus.FAILED).length ?? 0;

  return (
    <>
      <Head>
        <title>Sandbox Environments | 18th Module Registry</title>
        <meta name="description" content="Manage your virtual Magento sandbox environments for module testing." />
      </Head>

      <div className="space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase italic flex items-center gap-4 font-heading">
              <div className="p-3 bg-slate-950 rounded-2xl shadow-xl">
                <Terminal className="w-8 h-8 text-primary" />
              </div>
              Sandbox Environments
            </h1>
            <p className="text-slate-500 font-medium italic">
              Ephemeral Magento environments for module validation and testing.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className={cn('w-2 h-2 rounded-full', activeCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300')} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600 italic">
                {activeCount} Active
              </span>
            </div>
            <Button
              variant="secondary"
              className="h-11 px-5 border-slate-200 gap-2"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RotateCw className={cn('w-4 h-4 text-slate-400', isFetching && 'animate-spin')} />
            </Button>
            <Link href="/library">
              <Button className="h-11 px-6 bg-slate-950 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-slate-900/10 gap-2">
                <Plus className="w-4 h-4" /> New Sandbox
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit border border-slate-100">
          {(['active', 'all', 'terminated'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-5 py-2 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all',
                filter === f
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredSessions && filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SandboxCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <EmptyState filter={filter} />
        )}
      </div>
    </>
  );
}

function SandboxCard({ session }: { session: SandboxSession }) {
  const cfg = statusConfig[session.status] ?? statusConfig[SandboxStatus.REQUESTED];
  const Icon = cfg.icon;
  const isActive = session.status !== SandboxStatus.TERMINATED && session.status !== SandboxStatus.FAILED;
  const isRunning = session.status === SandboxStatus.RUNNING;

  return (
    <Link href={`/sandboxes/${session.id}`}>
      <Card className={cn(
        'group flex flex-col h-full hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer p-0 overflow-hidden',
        !isActive && 'opacity-70'
      )}>
        {/* Status Strip */}
        <div className={cn('px-6 py-3 flex items-center gap-3 border-b border-slate-50', cfg.color.replace('text-', 'bg-').split(' ')[0])}>
          <Icon className={cn('w-4 h-4', cfg.color.split(' ')[1], cfg.pulse && 'animate-pulse')} />
          <span className={cn('text-[10px] font-black uppercase tracking-widest italic', cfg.color.split(' ')[1])}>
            {cfg.label}
          </span>
          {isRunning && (
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase text-green-600 tracking-widest">Live</span>
            </div>
          )}
        </div>

        <div className="p-7 flex-1 flex flex-col gap-5">
          {/* Environment Spec */}
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-2xl transition-colors',
              isActive ? 'bg-slate-950 text-primary' : 'bg-slate-100 text-slate-400'
            )}>
              <Server className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-slate-900 uppercase tracking-tight italic text-sm">
                Magento {session.stackProfile?.magentoVersion ?? '—'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium italic">
                PHP {session.stackProfile?.phpVersion ?? '—'} • MySQL 8.0
              </p>
            </div>
          </div>

          {/* Session Meta */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Session ID</span>
              <span className="font-mono text-[10px] text-slate-500 truncate ml-2 max-w-[140px]">{session.id.split('-')[0]}…</span>
            </div>
            {session.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Expires</span>
                <span className="text-[10px] font-bold italic text-slate-600">
                  {formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Created</span>
              <span className="text-[10px] font-bold italic text-slate-600">
                {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className={cn(
            'flex items-center justify-end gap-1 text-[10px] font-black uppercase italic tracking-widest transition-all',
            isActive ? 'text-primary opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0' : 'text-slate-400 opacity-60'
          )}>
            View Details <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="text-center py-32 bg-white border border-dashed border-slate-200 rounded-[3.5rem] space-y-6">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
        <Terminal className="w-12 h-12 text-slate-200" />
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter font-heading">
          {filter === 'active' ? 'No Active Environments' : 'No Sessions Found'}
        </h3>
        <p className="text-slate-500 font-medium italic max-w-sm mx-auto leading-relaxed">
          {filter === 'active'
            ? 'Launch a sandbox from any module in the library to start validating your code in a real Magento environment.'
            : 'No sandbox sessions match the current filter.'}
        </p>
      </div>
      <Link href="/library">
        <Button className="mt-4 h-12 px-8 bg-slate-950 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-slate-900/10 gap-2">
          <Play className="w-4 h-4 fill-current" /> Launch from Library
        </Button>
      </Link>
    </div>
  );
}

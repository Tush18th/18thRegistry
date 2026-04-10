import React, { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Terminal, 
  Search, 
  Filter, 
  Trash2, 
  Monitor, 
  Clock, 
  User, 
  Package, 
  MoreVertical,
  Activity,
  AlertCircle,
  Play
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { RequireRole } from '@/components/auth/RequireRole';
import { UserRole } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SandboxAdminMonitoring() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all sandboxes (Admin endpoint)
  const { data: sessions, isLoading, refetch } = useQuery(
    ['admin-sandboxes'],
    async () => {
      const res = await api.get('/sandbox-admin/sandboxes');
      return res.data;
    },
    { refetchInterval: 10000 }
  );

  // Fetch global metrics
  const { data: metrics } = useQuery(
    ['sandbox-metrics'],
    async () => {
      const res = await api.get('/sandbox-admin/metrics');
      return res.data;
    }
  );

  const terminateMutation = useMutation(
    async (id: string) => {
      await api.delete(`/sandbox-admin/sandboxes/${id}/teardown`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-sandboxes']);
        queryClient.invalidateQueries(['sandbox-metrics']);
      }
    }
  );

  const retryMutation = useMutation(
    async (id: string) => {
      await api.post(`/sandbox-admin/sandboxes/${id}/retry`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-sandboxes']);
      }
    }
  );

  const handleTerminate = (id: string) => {
    if (confirm('Admin Override: Force terminate this infrastructure session?')) {
      terminateMutation.mutate(id);
    }
  };

  const filteredSessions = sessions?.filter((s: any) => 
    s.id.includes(searchTerm) || 
    s.userId.includes(searchTerm) || 
    s.moduleId.includes(searchTerm)
  ) || [];

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
      <Head>
        <title>Infra Monitoring | 18th Module Registry</title>
      </Head>

      <div className="p-8 max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tighter italic flex items-center gap-4">
                 <Monitor className="text-primary w-10 h-10" /> INFRA MONITORING
              </h1>
              <p className="text-slate-500 font-medium italic">Global orchestration health and active Magento testing sessions.</p>
           </div>
           
           <div className="flex gap-4">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                 <input 
                   type="text"
                   placeholder="Search sessions, users, or modules..."
                   className="pl-12 pr-6 h-14 bg-surface border border-border rounded-2xl focus:ring-primary/20 focus:border-primary text-white italic font-bold text-sm w-96 transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <Button variant="secondary" className="h-14 px-6 rounded-2xl border-border bg-surface text-slate-400 font-black uppercase italic">
                 <Filter className="w-5 h-5" />
              </Button>
           </div>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <AdminStatCard 
             label="Active Sessions" 
             value={metrics?.activeCount || 0} 
             subLabel="Currently provisioned" 
             icon={<Activity className="text-primary" />} 
           />
           <AdminStatCard 
             label="Pending Queue" 
             value={metrics?.queueDepth || 0} 
             subLabel="Awaiting workers" 
             icon={<Clock className="text-blue-500" />} 
           />
           <AdminStatCard 
             label="Health Score" 
             value="98.2%" 
             subLabel="Job success rate" 
             icon={<Activity className="text-green-500" />} 
           />
           <AdminStatCard 
             label="Failures (24h)" 
             value="12" 
             subLabel="Requires investigation" 
             icon={<AlertCircle className="text-red-500" />} 
           />
        </div>

        {/* Sessions Table */}
        <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-black/20 border-b border-border/50 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] italic">
                       <th className="px-8 py-6">Session & Status</th>
                       <th className="px-8 py-6">Owner / Module</th>
                       <th className="px-8 py-6">Stack Profile</th>
                       <th className="px-8 py-6">Age / Expiry</th>
                       <th className="px-8 py-6 text-right">Control</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/20">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center text-slate-500 font-black italic uppercase tracking-widest animate-pulse">
                           Synchronizing infrastructure state...
                        </td>
                      </tr>
                    ) : filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center text-slate-500 font-black italic uppercase tracking-widest">
                           No active sandbox sessions found.
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((s: any) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800",
                                   s.status === 'failed' ? "text-red-500" : "text-primary"
                                 )}>
                                    <Monitor className="w-5 h-5" />
                                 </div>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                       <span className="text-sm font-bold text-white tracking-tight leading-none truncate max-w-[120px]">
                                          {s.id.split('-')[0]}
                                       </span>
                                       <Badge variant={s.status === 'running' ? 'success' : s.status === 'failed' ? 'danger' : 'default'} className="text-[9px] font-black uppercase italic tracking-widest py-0">
                                          {s.status}
                                       </Badge>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">PROVISIONED</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="space-y-1">
                                 <p className="text-sm font-bold text-slate-300 flex items-center gap-1.5 leading-none">
                                    <User className="w-3 h-3" /> {s.userId.split('-')[0]}...
                                 </p>
                                 <p className="text-xs text-slate-500 italic font-medium truncate max-w-[150px]">
                                    {s.moduleId}
                                 </p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <span className="text-xs font-bold text-slate-400 uppercase italic tracking-tight">Magento 2.4.6</span>
                                 <span className="text-[10px] text-slate-600 font-mono">PHP 8.2 • Redis • DB</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="space-y-1">
                                 <p className="text-sm font-bold text-slate-300 italic">{format(new Date(s.createdAt), 'HH:mm:ss')}</p>
                                 <p className="text-[10px] text-red-500 font-black uppercase tracking-widest italic">Expiring Shortly</p>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 {s.status === 'failed' && (
                                   <button 
                                     onClick={() => retryMutation.mutate(s.id)}
                                     className="p-3 bg-surface border border-border rounded-xl text-green-500/50 hover:text-green-500 transition-colors"
                                     title="Retry Provisioning"
                                   >
                                      <RotateCw className="w-4 h-4" />
                                   </button>
                                 )}
                                 <button 
                                   onClick={() => handleTerminate(s.id)}
                                   className="p-3 bg-surface border border-border rounded-xl text-red-500/50 hover:text-red-500 transition-colors"
                                   title="Force Kill"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                                 <Link href={`/sandboxes/${s.id}`}>
                                    <button className="p-3 bg-surface border border-border rounded-xl text-slate-600 hover:text-white transition-colors">
                                       <Activity className="w-4 h-4" />
                                    </button>
                                 </Link>
                              </div>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </RequireRole>
  );
}

function AdminStatCard({ label, value, subLabel, icon }: { label: string; value: string | number; subLabel: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-8 space-y-6 shadow-xl shadow-black/20 group hover:border-primary/30 transition-all">
       <div className="flex items-center justify-between">
          <div className="p-4 bg-black/40 rounded-2xl group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">{label}</p>
          <p className="text-xs text-slate-600 font-medium italic">{subLabel}</p>
       </div>
    </div>
  );
}

function RotateCw(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    )
}

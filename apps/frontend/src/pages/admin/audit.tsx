import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  History, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  User,
  Clock,
  Activity
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { RequireRole } from '@/components/auth/RequireRole';
import { UserRole } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useQuery(
    ['audit-logs', page],
    async () => {
      const res = await api.get(`/audit-logs?limit=${limit}&skip=${page * limit}`);
      return res.data;
    },
    { keepPreviousData: true }
  );

  const logs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
            <History className="mr-3 w-8 h-8 text-primary" />
            System Audit Logs
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Track all administrative actions and security events across the platform.</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-border/50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500 font-bold italic">
                      Synchronizing logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500 font-bold italic">
                      No logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary transition-colors group-hover:text-black">
                             <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none">{log.action.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-tighter">Security Event</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 flex items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mr-2 text-indigo-400">
                          <User className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-gray-300 font-semibold">{log.actorId || 'System'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-[10px] font-black uppercase tracking-widest border border-border/50">
                          {log.targetResource || 'Generic'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
                          View Payload
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-black/10">
            <p className="text-sm text-gray-500 font-bold italic">
               Showing {logs.length} of {total} events
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-surface border border-border text-gray-400 hover:text-white disabled:opacity-30 transition-all font-black text-xs uppercase"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-surface border border-border text-gray-400 hover:text-white disabled:opacity-30 transition-all font-black text-xs uppercase"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}

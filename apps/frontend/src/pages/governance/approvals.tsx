import React from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MessageSquare,
  ShieldCheck,
  LayoutGrid,
  FileText,
  Loader
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function ApprovalsDashboard() {
  const queryClient = useQueryClient();

  const { data: pendingModules, isLoading } = useQuery('pending-modules', async () => {
    const res = await api.get('/governance/pending');
    return res.data;
  });

  const updateStatusMutation = useMutation(
    async ({ id, status, reviewNote }: { id: string; status: string; reviewNote: string }) => {
      return api.patch(`/governance/modules/${id}/status`, { status, reviewNote });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-modules');
      }
    }
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <>
      <Head>
        <title>Governance Approvals | 18th Module Registry</title>
      </Head>

      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic">
              <ShieldCheck className="text-primary w-10 h-10" /> GOVERNANCE GATE
            </h1>
            <p className="text-gray-400 font-medium">Reviewing {pendingModules?.length || 0} modules waiting for structural and quality approval.</p>
          </div>
          
          <div className="flex gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <Input className="pl-10 w-64 bg-gray-900/50" placeholder="Filter by Vendor..." />
             </div>
             <Button variant="ghost" size="sm" className="gap-2"><Filter className="w-4 h-4" /> Filters</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {pendingModules && pendingModules.length > 0 ? (
            pendingModules.map((mod: any) => (
              <Card key={mod.id} className="overflow-hidden border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40 transition-all">
                <div className="flex">
                  <div className="w-1.5 bg-yellow-500" />
                  <div className="flex-1 p-6 flex items-start justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="info" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">PENDING REVIEW</Badge>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{mod.vendor}_{mod.name}</h2>
                      </div>
                      
                      <div className="flex gap-8 text-sm">
                        <div className="space-y-1">
                           <span className="text-gray-500 uppercase text-[10px] font-bold">Namespace</span>
                           <p className="font-mono text-gray-300">{mod.namespace}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-gray-500 uppercase text-[10px] font-bold">Category</span>
                           <p className="text-gray-300 capitalize">{mod.category || 'General'}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-gray-500 uppercase text-[10px] font-bold">Created</span>
                           <p className="text-gray-300">{new Date(mod.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 max-w-2xl line-clamp-2">{mod.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex flex-col gap-2 w-48">
                       <Button 
                          variant="secondary" 
                          className="bg-green-600 hover:bg-green-500 text-white gap-2 font-black"
                          onClick={() => updateStatusMutation.mutate({ id: mod.id, status: 'approved', reviewNote: 'Module meets structural and coding standards.' })}
                        >
                          <CheckCircle className="w-4 h-4" /> APPROVE
                       </Button>
                       <Button 
                          variant="ghost" 
                          className="text-red-400 hover:bg-red-500/10 gap-2 font-bold"
                          onClick={() => updateStatusMutation.mutate({ id: mod.id, status: 'draft', reviewNote: 'Rejection: Please fix namespace alignment.' })}
                        >
                          <XCircle className="w-4 h-4" /> REJECT
                       </Button>
                       <Button variant="ghost" size="sm" className="text-gray-500 text-[10px] font-black tracking-widest uppercase">
                         <FileText className="w-3 h-3 mr-1" /> View Files
                       </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 border border-dashed border-gray-800 rounded-3xl">
               <ShieldCheck className="w-16 h-16 text-gray-800 mx-auto" />
               <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-500 italic">Clear Skies</h3>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">All submitted modules have been reviewed. The registry is healthy and up to date.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

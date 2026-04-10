import React, { useState } from 'react';
import Head from 'next/head';
import { useMutation } from 'react-query';
import { RefreshCw, GitBranch, Terminal, CheckCircle, Loader, Play } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function Ingestion() {
  const [repoUrl, setRepoUrl] = useState('');
  const [gitRef, setGitRef] = useState('master');

  const mutation = useMutation(async (data: { repoUrl: string; gitRef: string }) => {
    const res = await api.post('/ingestion/sync', data);
    return res.data;
  });

  const handleSync = () => {
    if (!repoUrl) return;
    mutation.mutate({ repoUrl, gitRef });
  };

  return (
    <>
      <Head>
        <title>Ingestion Engine | 18th Module Registry</title>
      </Head>
      
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter flex items-center gap-4 italic font-heading uppercase">
              <RefreshCw className="w-12 h-12 text-primary" /> INGESTION ENGINE
            </h1>
            <p className="text-slate-500 font-medium italic">Connect Git repositories to automatically discover and index architectural modules.</p>
          </div>
          {mutation.isSuccess && (
            <Badge variant="info" className="py-2 px-6 bg-green-50 text-green-600 border-green-100 flex items-center gap-2 animate-in zoom-in-95 font-heading italic uppercase tracking-widest text-[10px]">
               <CheckCircle className="w-4 h-4" /> Discovery Hub Scanned
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="p-0 overflow-hidden shadow-premium border-slate-100">
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 italic">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-heading">Operational Input</h3>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic font-heading">Repository Endpoint</label>
                <div className="relative group">
                  <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="https://github.com/vendor/repo.git" 
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    className="pl-12 h-16 bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic font-heading">Revision Reference (Branch/Tag)</label>
                <Input 
                  placeholder="master" 
                  value={gitRef}
                  onChange={e => setGitRef(e.target.value)}
                  className="h-16 bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                />
              </div>
              <Button 
                fullWidth 
                variant="glow"
                size="lg"
                onClick={handleSync}
                disabled={!repoUrl || mutation.isLoading}
                className="h-16"
              >
                {mutation.isLoading ? (
                  <><Loader className="w-5 h-5 animate-spin mr-3" /> Synchronizing...</>
                ) : (
                  <><Play className="w-5 h-5 mr-3 fill-current" /> Initialize Discovery</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="p-0 overflow-hidden shadow-2xl border-slate-900 bg-slate-950">
            <div className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center italic">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-heading">System Output Log</h3>
              <div className="flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>
            <CardContent className="p-8">
              <div className="font-mono text-xs text-slate-300 h-72 overflow-y-auto space-y-4 custom-scrollbar">
                {mutation.isIdle && (
                  <div className="flex gap-3">
                    <span className="text-slate-700 tracking-tighter">14:02:11</span>
                    <p className="text-slate-600 italic">SYSTEM READY: Awaiting repository endpoint...</p>
                  </div>
                )}
                {mutation.isLoading && (
                  <div className="flex gap-3 animate-pulse">
                    <span className="text-primary/50 tracking-tighter">DISCOVERY</span>
                    <p className="text-primary italic">&gt; [CONNECTING] Cloning repository from {repoUrl}...</p>
                  </div>
                )}
                {mutation.isSuccess && (
                  <>
                    <div className="flex gap-3">
                      <span className="text-green-500/50 tracking-tighter">DISCOVERY</span>
                      <p className="text-green-500">&gt; [SUCCESS] Architectural scan complete.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-green-500/50 tracking-tighter">DISCOVERY</span>
                      <p className="text-green-400 font-bold">&gt; [INDEXED] {mutation.data?.count || '0'} verified modules discovered.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <span className="text-slate-700 tracking-tighter">LOGS</span>
                      <p className="text-slate-500 italic">&gt; Job Identification: {mutation.data?.jobId || '---'}</p>
                    </div>
                  </>
                )}
                {mutation.isError && (
                  <>
                    <div className="flex gap-3">
                      <span className="text-red-500/50 tracking-tighter">ERROR</span>
                      <p className="text-red-500 font-black uppercase italic">&gt; Sync protocol failed.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-red-500/50 tracking-tighter">ERROR</span>
                      <p className="text-red-400 font-medium italic">{ (mutation.error as any)?.response?.data?.message || 'Check network integrity or endpoint URL.'}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

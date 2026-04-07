import React, { useState } from 'react';
import Head from 'next/head';
import { useMutation, useQuery } from 'react-query';
import { RefreshCw, GitBranch, Terminal, CheckCircle, AlertCircle, Loader, Play } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary" /> Ingestion Engine
          </h1>
          <p className="text-gray-400 mt-1">Connect Git repositories to automatically discover and index Magento modules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" /> Trigger Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Repository URL</label>
                <Input 
                  placeholder="https://github.com/vendor/repo.git" 
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Git branch / tag</label>
                <Input 
                  placeholder="master" 
                  value={gitRef}
                  onChange={e => setGitRef(e.target.value)}
                />
              </div>
              <Button 
                fullWidth 
                onClick={handleSync}
                disabled={!repoUrl || mutation.isLoading}
                className="gap-2"
              >
                {mutation.isLoading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Syncing...</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> Start Discovery Hub Sync</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gray-500" /> Output Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xs bg-black p-4 rounded-md border border-gray-800 h-64 overflow-y-auto space-y-2">
                {mutation.isIdle && <p className="text-gray-600 italic">// Ready to receive logs...</p>}
                {mutation.isLoading && <p className="text-primary animate-pulse">&gt; Cloning repository from {repoUrl}...</p>}
                {mutation.isSuccess && (
                  <>
                    <p className="text-green-500">&gt; [SUCCESS] Repository scanned.</p>
                    <p className="text-green-500">&gt; [SUCCESS] {mutation.data?.count || '0'} modules discovered and updated.</p>
                    <p className="text-gray-500">&gt; Transaction ID: {mutation.data?.jobId || '---'}</p>
                  </>
                )}
                {mutation.isError && (
                  <>
                    <p className="text-red-500">&gt; [ERROR] Sync failed.</p>
                    <p className="text-red-400 font-bold">{ (mutation.error as any)?.response?.data?.message || 'Check Git URL or Network Connection'}</p>
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

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { 
  GitPullRequest, 
  ArrowLeft, 
  ShieldAlert, 
  Terminal, 
  Loader, 
  CheckCircle, 
  Key,
  Database,
  ExternalLink,
  Lock,
  Globe,
  ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function ExportPage() {
  const router = useRouter();
  const { workspaceId, type } = router.query;

  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('feature/18th-refined');
  const [token, setToken] = useState('');
  const [isDone, setIsDone] = useState(false);

  const exportMutation = useMutation(async () => {
    const res = await api.post('/export/git', {
      workspaceId,
      type,
      repoUrl,
      branch,
      token,
      commitMessage: `chore: Exporting grounded module from 18th Registry [${workspaceId}]`
    });
    return res.data;
  }, {
    onSuccess: () => {
      setIsDone(true);
    }
  });

  return (
    <>
      <Head>
        <title>Export to Git | 18th Module Registry</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-8 pb-20">
         <Link href="/library">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 p-0 hover:bg-transparent text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </Button>
        </Link>

        <div className="space-y-2">
           <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic">
              <GitPullRequest className="text-primary w-10 h-10" /> EXIT PROTOCOL: GIT EXPORT
           </h1>
           <p className="text-gray-400 font-medium italic">Synchronize your validated module workspace to a target repository.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-6">
              <Card className="bg-gray-900/40 border-gray-800 p-8">
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Target Repository URL</label>
                       <div className="relative group">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="https://github.com/organization/target-repo" 
                            className="bg-black/40 border-gray-800 h-14 pl-12 rounded-2xl text-lg"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Export Branch</label>
                          <Input 
                            placeholder="feature/..." 
                            className="bg-black/40 border-gray-800 h-12"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <Lock className="w-3 h-3 text-yellow-500" /> Git PAT / Token
                          </label>
                          <Input 
                            type="password"
                            placeholder="ghp_..." 
                            className="bg-black/40 border-gray-800 h-12"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                          />
                       </div>
                    </div>
                    
                    <Button 
                       fullWidth 
                       size="lg" 
                       className="h-14 bg-primary text-black font-black italic uppercase shadow-xl shadow-primary/20 mt-4"
                       onClick={() => exportMutation.mutate()}
                       disabled={!repoUrl || !token || exportMutation.isLoading || isDone}
                    >
                       {exportMutation.isLoading ? (
                          <><Loader className="animate-spin mr-2" /> Initializing Push...</>
                       ) : isDone ? (
                          <><CheckCircle className="mr-2" /> Export Complete</>
                       ) : (
                          <><Terminal className="mr-2" /> Push to Repository</>
                       )}
                    </Button>

                    {exportMutation.isError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                           <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                           <span>{(exportMutation.error as any).response?.data?.error || 'Git synchronization failed. Please check your token and URL.'}</span>
                        </div>
                    )}
                 </div>
              </Card>

              {isDone && (
                <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-3xl space-y-4 animate-in zoom-in-95 duration-500">
                   <div className="flex items-center gap-4 text-green-400">
                      <div className="p-3 bg-green-500/20 rounded-2xl"><CheckCircle className="w-10 h-10" /></div>
                      <div>
                         <h3 className="text-xl font-black italic uppercase tracking-tight">Sync Established!</h3>
                         <p className="text-sm text-gray-500 font-medium">Your module has been pushed to `{branch}`.</p>
                      </div>
                   </div>
                   <div className="pt-4 flex gap-4">
                      <Button onClick={() => window.open(repoUrl, '_blank')} variant="secondary" className="bg-gray-800 font-bold uppercase italic h-12 px-6">
                         <ExternalLink className="mr-2 w-4 h-4" /> Open Repository
                      </Button>
                      <Link href="/library">
                         <Button variant="ghost" className="text-gray-500 font-bold uppercase h-12">Return to Index</Button>
                      </Link>
                   </div>
                </div>
              )}
           </div>

           <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/10">
                 <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                       <Key className="w-4 h-4" /> Privacy & Security
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <p className="text-[11px] text-gray-400 leading-relaxed italic">
                       Authentication tokens are used exclusively for this ephemeral session. We do not persist your personal access tokens in the registry database.
                    </p>
                    <div className="pt-4 border-t border-primary/10 space-y-2">
                       <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Supported Origins</p>
                       <div className="flex gap-4">
                          <Globe className="w-5 h-5 text-gray-700" />
                          <ShieldCheck className="w-5 h-5 text-gray-700" />
                          <Database className="w-5 h-5 text-gray-700" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </>
  );
}

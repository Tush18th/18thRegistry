import React, { useState } from 'react';
import Head from 'next/head';
import { useMutation, useQuery } from 'react-query';
import { 
  GitBranch, 
  ArrowLeft, 
  Search, 
  Database, 
  Loader, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Info,
  ExternalLink,
  Settings2
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function IngestionPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [gitRef, setGitRef] = useState('main');
  const [isSuccess, setIsSuccess] = useState(false);

  const syncMutation = useMutation(async () => {
    const res = await api.post('/ingestion/sync', { repoUrl, gitRef });
    return res.data;
  }, {
    onSuccess: () => {
      setIsSuccess(true);
    }
  });

  return (
    <>
      <Head>
        <title>Ingest Repository | 18th Module Registry</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-8 pb-20">
         <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="space-y-2">
           <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic">
              <Database className="text-primary w-10 h-10" /> REPOSITORY INGESTION
           </h1>
           <p className="text-gray-400 font-medium italic">Feed the registry with established architectural patterns from your organization.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-6">
              <Card className="bg-gray-900/40 border-gray-800 p-8">
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Git Repository URL</label>
                       <div className="relative group">
                          <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="https://github.com/organization/magento2-repo" 
                            className="bg-black/40 border-gray-800 h-14 pl-12 rounded-2xl text-lg"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Git Ref / Branch</label>
                          <Input 
                            placeholder="main" 
                            className="bg-black/40 border-gray-800 h-12"
                            value={gitRef}
                            onChange={(e) => setGitRef(e.target.value)}
                          />
                       </div>
                       <div className="flex items-end pb-1">
                           <p className="text-[10px] text-gray-600 italic">Defaulting to `main` if left empty.</p>
                       </div>
                    </div>
                    
                    <Button 
                       fullWidth 
                       size="lg" 
                       className="h-14 bg-primary text-black font-black italic uppercase shadow-xl shadow-primary/20 mt-4"
                       onClick={() => syncMutation.mutate()}
                       disabled={!repoUrl || syncMutation.isLoading || isSuccess}
                    >
                       {syncMutation.isLoading ? (
                          <><Loader className="animate-spin mr-2" /> Initializing Scan...</>
                       ) : isSuccess ? (
                          <><CheckCircle className="mr-2" /> Job Enqueued</>
                       ) : (
                          <><Zap className="mr-2" /> Start Architectural Discovery</>
                       )}
                    </Button>

                    {isSuccess && (
                       <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl animate-in zoom-in-95 duration-500">
                          <div className="flex items-center gap-4 text-green-400 mb-2">
                             <CheckCircle className="w-6 h-6" />
                             <span className="font-bold">Sync workflow initiated!</span>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed">
                             Our background worker has started scanning the repository. Modules discovered will be added to the registry as `PENDING` for maintainer review.
                          </p>
                          <div className="pt-4 flex gap-4">
                             <Link href="/library">
                                <Button size="sm" variant="secondary" className="bg-gray-800 font-bold uppercase italic">View Library</Button>
                             </Link>
                             <Button size="sm" variant="ghost" onClick={() => { setRepoUrl(''); setIsSuccess(false); }} className="text-gray-500 font-bold">New Sync</Button>
                          </div>
                       </div>
                    )}
                 </div>
              </Card>

              {/* Technical Context */}
              <div className="p-6 bg-gray-900/30 border border-gray-800/50 rounded-2xl">
                 <div className="flex gap-4">
                    <div className="p-3 bg-gray-800 rounded-xl"><Info className="w-6 h-6 text-blue-500" /></div>
                    <div className="space-y-2">
                       <h4 className="text-white font-bold uppercase tracking-tight italic">Scan Logic</h4>
                       <p className="text-sm text-gray-500 leading-relaxed">
                          The ingestion engine performs a shallow clone of the repository and recursively searches for `registration.php` and `module.xml` combinations. 
                          It extracts `composer.json` metadata and infers 'Capabilities' based on folder structures (e.g. `Api/`, `Observer/`, `Plugin/`).
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/10">
                 <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                       <Settings2 className="w-4 h-4" /> Discovery Scope
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <ul className="space-y-4">
                       <DiscoveryItem label="Metadata Intelligence" desc="Auto-extracts vendor, namespace, and version." />
                       <DiscoveryItem label="Capability Inference" desc="Detects Plugins, GraphQL, and APIs." />
                       <DiscoveryItem label="Dependency Mapping" desc="Indexes required Magento core modules." />
                       <DiscoveryItem label="Pattern Extraction" desc="Prepares code for the AI generator." />
                    </ul>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </>
  );
}

function DiscoveryItem({ label, desc }: { label: string; desc: string }) {
  return (
    <li className="space-y-1">
       <div className="flex items-center gap-2 text-white font-bold text-sm">
          <CheckCircle className="w-3 h-3 text-primary" /> {label}
       </div>
       <p className="text-[10px] text-gray-500 italic pl-5">{desc}</p>
    </li>
  );
}

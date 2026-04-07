import React, { useState } from 'react';
import { 
  GitBranch, 
  Globe, 
  Lock, 
  Send, 
  Loader, 
  CheckCircle, 
  AlertCircle, 
  Terminal,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface ExportWizardProps {
  workspaceId: string;
  type: 'ai' | 'clone';
  defaultBranch?: string;
  onSuccess?: (repoUrl: string, branch: string) => void;
  className?: string;
}

export const ExportWizard: React.FC<ExportWizardProps> = ({ 
  workspaceId, 
  type, 
  defaultBranch = 'feature/18th-refined',
  onSuccess,
  className 
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    repoUrl: '',
    branch: defaultBranch,
    commitMessage: `chore: publish grounded module [${workspaceId}] via 18th Platform`,
    token: '',
  });

  const handlePush = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/export/git', {
        workspaceId,
        type: type === 'ai' ? 'ai' : 'clone', // map generator to ai
        ...config
      });
      setStep(3);
      if (onSuccess) onSuccess(config.repoUrl, config.branch);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to push to repository. Verify your token and URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {step === 1 && (
        <Card className="bg-gray-900/40 border-gray-800 p-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="space-y-6">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                    <Globe className="text-primary w-5 h-5" /> REPOSITORY CONFIGURATION
                 </h3>
                 <p className="text-xs text-gray-500 font-medium italic">Define the destination for your validated architectural workspace.</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Git Repository URL</label>
                    <div className="relative group">
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                       <Input 
                         placeholder="https://github.com/organization/target-repo" 
                         className="bg-black/40 border-gray-800 h-12 pl-12 rounded-xl"
                         value={config.repoUrl}
                         onChange={e => setConfig({...config, repoUrl: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Branch</label>
                       <div className="relative group">
                          <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="feature/..." 
                            className="bg-black/40 border-gray-800 h-12 pl-12 rounded-xl"
                            value={config.branch}
                            onChange={e => setConfig({...config, branch: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3 text-yellow-500" /> Git PAT / Token
                       </label>
                       <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                          <Input 
                            type="password"
                            placeholder="ghp_..." 
                            className="bg-black/40 border-gray-800 h-12 pl-12 rounded-xl"
                            value={config.token}
                            onChange={e => setConfig({...config, token: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <Button 
                 fullWidth 
                 size="lg" 
                 className="h-12 bg-primary text-black font-black uppercase italic shadow-xl shadow-primary/20 mt-4"
                 disabled={!config.repoUrl || !config.token}
                 onClick={() => setStep(2)}
              >
                 Next Phase: Verification <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
           </div>
        </Card>
      )}

      {step === 2 && (
        <div className="bg-gray-900/60 border border-primary/20 rounded-3xl p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl shadow-primary/5">
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                 <Terminal className="text-primary w-6 h-6" /> EXIT PROTOCOL: REVIEW
              </h3>
              <p className="text-sm text-gray-500">Confirming the deployment of validated files to the target remote.</p>
           </div>

           <div className="p-6 bg-black/40 rounded-2xl border border-gray-800 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-gray-800/50">
                 <span className="text-gray-600 font-bold uppercase tracking-widest text-[9px]">Target Host</span>
                 <span className="text-primary font-bold italic">{config.repoUrl}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-800/50">
                 <span className="text-gray-600 font-bold uppercase tracking-widest text-[9px]">Destination Branch</span>
                 <span className="text-white bg-gray-800 px-3 py-1 rounded-lg">{config.branch}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-gray-600 font-bold uppercase tracking-widest text-[9px]">Commit Hash (Simulated)</span>
                 <span className="text-gray-400 font-bold">18TH-GEN-{workspaceId.slice(0, 8)}</span>
              </div>
           </div>

           {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs animate-in shake duration-500">
                 <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </div>
           )}

           <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => setStep(1)} className="h-14 bg-gray-800 font-black italic uppercase" disabled={loading}>
                 Modify Settings
              </Button>
              <Button 
                  onClick={handlePush} 
                  disabled={loading}
                  className="h-14 bg-primary text-black font-black italic uppercase shadow-xl shadow-primary/20"
              >
                {loading ? <><Loader className="mr-2 w-5 h-5 animate-spin" /> Synchronizing...</> : <><Send className="mr-2 w-5 h-5" /> Push to Repository</>}
              </Button>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-20 bg-green-500/5 border border-green-500/10 rounded-3xl text-center space-y-6 shadow-2xl shadow-green-500/5 animate-in zoom-in-95 duration-700">
           <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40 animate-bounce">
              <CheckCircle className="w-12 h-12" />
           </div>
           <div className="space-y-2">
              <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase">SYNC COMPLETE!</h3>
              <p className="text-gray-500 font-medium italic">Your architectural masterpiece has been successfully delivered.</p>
           </div>
           <div className="pt-8 flex justify-center gap-4">
              <Button onClick={() => window.open(config.repoUrl.replace('.git', ''), '_blank')} className="h-14 bg-white text-black font-black uppercase italic px-8 hover:bg-gray-100">
                 <ExternalLink className="mr-2 w-5 h-5" /> Open Repository
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)} className="text-gray-500 font-bold uppercase italic tracking-widest text-[11px] h-14">
                 New Export
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};

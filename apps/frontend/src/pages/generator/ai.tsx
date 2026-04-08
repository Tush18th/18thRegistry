import React, { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from 'react-query';
import { 
  Sparkles, 
  Search, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Package, 
  ArrowLeft,
  Settings2,
  Cpu,
  Zap,
  GitBranch
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { QualityCheck, ValidationResult } from '@/components/validation/QualityCheck';
import { ExportWizard } from '@/components/export/ExportWizard';

export default function AiGeneratorWizard() {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [intent, setIntent] = useState('');
  const [identity, setIdentity] = useState({ vendor: '', moduleName: '' });
  const [validationInfo, setValidationInfo] = useState<{ status: 'passed' | 'failed', results: ValidationResult[] } | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  const { data: registryModules } = useQuery(['registry-search', search], async () => {
    const res = await api.get('/modules/search', { params: { query: search } });
    return res.data;
  });

  const generateMutation = useMutation(async () => {
    const response = await api.post('/generation/ai', {
      vendor: identity.vendor,
      moduleName: identity.moduleName,
      intent,
      referenceModuleIds: selectedModuleIds
    }, {
      responseType: 'blob',
    });

    // Handle response headers for validation state
    const status = response.headers['x-validation-status'] === 'passed' ? 'passed' : 'failed';
    const blockers = parseInt(response.headers['x-validation-blockers'] || '0');
    const wsId = response.headers['x-workspace-id'];
    
    setWorkspaceId(wsId);
    setValidationInfo({ 
      status, 
      results: blockers > 0 ? [{ ruleId: 'V101', severity: 'BLOCKING_ERROR', message: `Found ${blockers} blocking issues.`, suggestion: 'Review refactoring details.' }] : [] 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${identity.vendor}_${identity.moduleName}_AI.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  });

  const toggleModule = (id: string) => {
    setSelectedModuleIds(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Head>
        <title>AI Module Generator | 18th Module Registry</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="space-y-2">
           <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic">
              <Sparkles className="text-primary w-10 h-10" /> AI MODULE GENERATOR
           </h1>
           <p className="text-gray-400 font-medium italic">Grounded in organization-specific patterns and architectural standards.</p>
        </div>

        {/* Wizard Progress */}
        <div className="flex items-center justify-between bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
           <Step title="Reference Patterns" active={step === 1} done={step > 1} number={1} />
           <div className="h-px bg-gray-800 flex-1 mx-4" />
           <Step title="Target Intent" active={step === 2} done={step > 2} number={2} />
           <div className="h-px bg-gray-800 flex-1 mx-4" />
           <Step title="Verification" active={generateMutation.isSuccess} done={false} number={3} />
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-end">
                <div className="space-y-1">
                   <h2 className="text-xl font-bold text-white uppercase italic">Select Inspiration</h2>
                   <p className="text-sm text-gray-500">Choose up to 3 modules for the AI to use as architectural context.</p>
                </div>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                   <Input 
                     placeholder="Search registry..." 
                     className="pl-10 h-10 bg-gray-900"
                     onChange={(e) => setSearch(e.target.value)}
                   />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registryModules?.map((mod: any) => (
                   <Card 
                     key={mod.id} 
                     className={cn(
                        "cursor-pointer transition-all border-2",
                        selectedModuleIds.includes(mod.id) ? "border-primary bg-primary/5" : "border-gray-800 bg-gray-900/40 hover:border-gray-700"
                     )}
                     onClick={() => toggleModule(mod.id)}
                   >
                      <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg", selectedModuleIds.includes(mod.id) ? "bg-primary text-black" : "bg-gray-800 text-gray-400")}>
                               <Package className="w-5 h-5" />
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-white uppercase tracking-tight">{mod.name}</h4>
                               <p className="text-[10px] text-gray-500 font-mono uppercase">{mod.vendor}</p>
                            </div>
                         </div>
                         {selectedModuleIds.includes(mod.id) && <CheckCircle className="w-5 h-5 text-primary" />}
                      </CardContent>
                   </Card>
                ))}
             </div>

             <div className="flex justify-end pt-6">
                <Button 
                   size="lg" 
                   disabled={selectedModuleIds.length === 0}
                   onClick={() => setStep(2)}
                   className="h-12 px-10 uppercase font-black italic bg-primary text-black"
                >
                   Next: Define Intent <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="md:col-span-2 space-y-6">
                <Card className="bg-gray-900/40 border-gray-800">
                   <CardHeader>
                      <CardTitle className="text-sm uppercase tracking-widest text-gray-500 italic">Module Identity</CardTitle>
                   </CardHeader>
                   <CardContent className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest">New Vendor</label>
                         <Input 
                            placeholder="PascalCase (e.g. AcmeCorp)" 
                            value={identity.vendor}
                            onChange={(e) => setIdentity({...identity, vendor: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Module Name</label>
                         <Input 
                            placeholder="PascalCase (e.g. PriceEngine)" 
                            value={identity.moduleName}
                            onChange={(e) => setIdentity({...identity, moduleName: e.target.value})}
                         />
                      </div>
                   </CardContent>
                </Card>

                <div className="space-y-4">
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Generator Intent</label>
                   <textarea 
                     className="w-full h-48 bg-gray-900 border border-gray-800 rounded-2xl p-6 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none shadow-inner"
                     placeholder="Describe the module logic in detail (e.g. 'Build a custom price provider that integrates with a 3rd party ERP API. Include a cache decorator and an admin configuration field...')"
                     value={intent}
                     onChange={(e) => setIntent(e.target.value)}
                   />
                </div>

                <div className="flex gap-4">
                   <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="h-12 px-8 uppercase font-black bg-gray-800">Back</Button>
                   <Button 
                      fullWidth 
                      size="lg" 
                      onClick={() => generateMutation.mutate()}
                      disabled={!intent || !identity.vendor || !identity.moduleName || generateMutation.isLoading}
                      className="h-12 uppercase font-black italic bg-primary text-black shadow-xl shadow-primary/20"
                   >
                      {generateMutation.isLoading ? (
                         <><Loader className="animate-spin mr-2 h-5 w-5" /> Grounding AI...</>
                      ) : (
                         <><Zap className="mr-2 h-5 w-5" /> Generate Module</>
                      )}
                   </Button>
                </div>
             </div>

             <div className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                   <CardHeader>
                      <CardTitle className="text-xs uppercase tracking-widest text-primary italic font-black flex items-center gap-2">
                         <Cpu className="w-4 h-4" /> Grounding Data
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      {selectedModuleIds.map(id => {
                         const mod = registryModules?.find((m: any) => m.id === id);
                         return (
                            <div key={id} className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl border border-gray-800">
                               <div className="p-2 bg-gray-800 rounded-lg"><Settings2 className="w-4 h-4 text-gray-400" /></div>
                               <span className="text-xs font-bold text-gray-300">{mod?.vendor}_{mod?.name}</span>
                            </div>
                         );
                      })}
                      <p className="text-[10px] text-gray-500 italic leading-relaxed pt-2">
                         Claude will ingest the `etc` configurations and core PSR-4 patterns from these modules to ensure architectural consistency.
                      </p>
                   </CardContent>
                </Card>
             </div>
          </div>
        )}

        {generateMutation.isSuccess && (
           <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <QualityCheck status={validationInfo?.status || 'passed'} results={validationInfo?.results || []} />
              
              <div className="p-1 bg-gray-900 border border-gray-800 rounded-2xl flex gap-2">
                 <button 
                   className={cn(
                      "flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 italic uppercase",
                      !showExport ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                   )}
                   onClick={() => setShowExport(false)}
                 >
                    <CheckCircle className="w-4 h-4" /> Verify Result
                 </button>
                 <button 
                   className={cn(
                      "flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 italic uppercase",
                      showExport ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                   )}
                   onClick={() => setShowExport(true)}
                 >
                    <GitBranch className="w-4 h-4" /> Push to Git
                 </button>
              </div>

              {!showExport ? (
                <div className="p-8 bg-green-950/20 border border-green-900/50 rounded-3xl space-y-6 shadow-2xl shadow-green-500/10">
                   <div className="flex items-center gap-4 text-green-400">
                      <div className="p-3 bg-green-500/20 rounded-2xl"><CheckCircle className="w-8 h-8" /></div>
                      <div>
                         <h3 className="text-2xl font-black italic uppercase tracking-tight">Generation Complete</h3>
                         <p className="text-sm text-gray-400 font-medium">Patterns extracted, grounded, and verified.</p>
                      </div>
                   </div>
                   
                   <p className="text-gray-400 leading-relaxed max-w-2xl">
                      The module `{identity.vendor}_{identity.moduleName}` has been generated successfully. 
                      A ZIP package containing the complete source code and structural configurations has been prepared and downloaded.
                   </p>

                   <div className="flex gap-4 pt-4">
                      <Link href="/">
                         <Button variant="secondary" className="bg-gray-800 font-black italic uppercase">Return to Registry</Button>
                      </Link>
                      <Button variant="ghost" onClick={() => window.location.reload()} className="text-gray-500 hover:text-white uppercase font-bold tracking-widest text-xs">Reset Generator</Button>
                   </div>
                </div>
              ) : (
                <ExportWizard 
                  workspaceId={workspaceId || ''} 
                  type="ai" 
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                />
              )}
           </div>
        )}
      </div>
    </>
  );
}

function Step({ title, active, done, number }: { title: string; active: boolean; done: boolean; number: number }) {
  return (
    <div className="flex items-center gap-3">
       <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all",
          done ? "bg-green-500 text-white" : active ? "bg-primary text-black scale-110 shadow-lg shadow-primary/20" : "bg-gray-800 text-gray-500"
       )}>
          {done ? <CheckCircle className="w-6 h-6" /> : number}
       </div>
       <span className={cn(
          "text-sm font-black uppercase tracking-tight italic transition-all",
          done ? "text-green-500" : active ? "text-white" : "text-gray-600"
       )}>
          {title}
       </span>
    </div>
  );
}

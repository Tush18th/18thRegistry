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

      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="space-y-4">
           <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter flex items-center gap-4 italic font-heading uppercase">
              <Sparkles className="text-primary w-12 h-12" /> AI GENERATOR
           </h1>
           <p className="text-slate-500 font-medium italic">Grounded in organization-specific patterns and architectural standard protocols.</p>
        </div>

        {/* Wizard Progress */}
        <div className="flex items-center justify-between bg-white border border-slate-100 p-8 rounded-[2rem] shadow-premium">
           <Step title="Reference Patterns" active={step === 1} done={step > 1} number={1} />
           <div className="h-px bg-slate-100 flex-1 mx-6" />
           <Step title="Target Intent" active={step === 2} done={step > 2} number={2} />
           <div className="h-px bg-slate-100 flex-1 mx-6" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="md:col-span-2 space-y-8">
                <Card className="p-0 overflow-hidden border-slate-100 shadow-premium">
                   <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 italic">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module Identity Protocol</h3>
                   </div>
                   <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">New Vendor</label>
                         <Input 
                            placeholder="PascalCase (AcmeCorp)" 
                            value={identity.vendor}
                            onChange={(e) => setIdentity({...identity, vendor: e.target.value})}
                            className="bg-slate-50/50 border-slate-100 focus:bg-white transition-all h-14"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Module Name</label>
                         <Input 
                            placeholder="PascalCase (PriceEngine)" 
                            value={identity.moduleName}
                            onChange={(e) => setIdentity({...identity, moduleName: e.target.value})}
                            className="bg-slate-50/50 border-slate-100 focus:bg-white transition-all h-14"
                         />
                      </div>
                   </div>
                </Card>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Generator Intent & Context</label>
                   <textarea 
                     className="w-full h-56 bg-white border border-slate-100 rounded-[2rem] p-8 text-slate-900 placeholder-slate-300 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none shadow-premium font-medium text-sm leading-relaxed"
                     placeholder="Describe the module logic in professional detail (e.g. 'Build a custom price provider that integrates with a 3rd party ERP API. Include a cache decorator and an admin configuration field...')"
                     value={intent}
                     onChange={(e) => setIntent(e.target.value)}
                   />
                </div>

                <div className="flex gap-4 pt-4">
                   <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="h-14 px-10">Back</Button>
                   <Button 
                      fullWidth 
                      size="lg" 
                      onClick={() => generateMutation.mutate()}
                      disabled={!intent || !identity.vendor || !identity.moduleName || generateMutation.isLoading}
                      variant="glow"
                      className="h-14"
                   >
                      {generateMutation.isLoading ? (
                         <><Loader className="animate-spin mr-3 h-5 w-5" /> Synchronizing Intelligence...</>
                      ) : (
                         <><Zap className="mr-3 h-5 w-5" /> Initiate Generation</>
                      )}
                   </Button>
                </div>
             </div>

             <div className="space-y-8">
                <Card className="p-8 border-primary/20 bg-primary/5 shadow-none space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white"><Cpu className="w-4 h-4" /></div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest italic text-primary">Grounding Context</h4>
                   </div>
                   <div className="space-y-3">
                      {selectedModuleIds.map(id => {
                         const mod = registryModules?.find((m: any) => m.id === id);
                         return (
                            <div key={id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-right-4">
                               <div className="p-1.5 bg-slate-50 rounded-lg"><Settings2 className="w-3.5 h-3.5 text-slate-400" /></div>
                               <span className="text-[11px] font-black text-slate-950 uppercase tracking-tight">{mod?.vendor}_{mod?.name}</span>
                            </div>
                         );
                      })}
                   </div>
                   <p className="text-[10px] text-slate-500 italic leading-loose pt-4 border-t border-primary/10">
                      Our engine will ingest the core architectural patterns from these modules to ensure strict organization parity.
                   </p>
                </Card>
             </div>
          </div>
        )}

        {generateMutation.isSuccess && (
           <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <QualityCheck status={validationInfo?.status || 'passed'} results={validationInfo?.results || []} />
              
              <div className="p-1.5 bg-white border border-slate-100 rounded-2xl flex gap-3 shadow-premium">
                 <button 
                   className={cn(
                      "flex-1 py-4 px-6 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-3 italic uppercase font-heading tracking-widest",
                      !showExport ? "bg-slate-950 text-white shadow-xl" : "text-slate-400 hover:text-slate-950"
                   )}
                   onClick={() => setShowExport(false)}
                 >
                    <CheckCircle className="w-4 h-4" /> Verify Result
                 </button>
                 <button 
                   className={cn(
                      "flex-1 py-4 px-6 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-3 italic uppercase font-heading tracking-widest",
                      showExport ? "bg-slate-950 text-white shadow-xl" : "text-slate-400 hover:text-slate-950"
                   )}
                   onClick={() => setShowExport(true)}
                 >
                    <GitBranch className="w-4 h-4" /> Push to Repository
                 </button>
              </div>

              {!showExport ? (
                <div className="p-12 bg-white border border-slate-100 rounded-[3rem] space-y-8 shadow-premium relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                      <Sparkles className="w-40 h-40 text-primary" />
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="p-5 bg-green-50 rounded-2xl text-green-500 shadow-sm shadow-green-100"><CheckCircle className="w-10 h-10" /></div>
                      <div className="space-y-1">
                         <h3 className="text-3xl font-black italic uppercase tracking-tighter font-heading text-slate-950">Generation Complete</h3>
                         <p className="text-sm text-slate-400 font-medium italic">Standardized patterns successfully extracted and grounded.</p>
                      </div>
                   </div>
                   
                   <p className="text-slate-500 leading-relaxed max-w-2xl font-medium italic">
                      The module <span className="text-slate-950 font-black tracking-tight">{identity.vendor}_{identity.moduleName}</span> has been architected. 
                      A complete source package has been prepared for local implementation.
                   </p>

                   <div className="flex items-center gap-6 pt-6">
                      <Link href="/">
                         <Button variant="secondary" size="lg" className="h-14 px-10">Back to Index</Button>
                      </Link>
                      <button onClick={() => window.location.reload()} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all italic underline underline-offset-8">
                        Recalibrate Generator
                      </button>
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
          "w-11 h-11 rounded-[14px] flex items-center justify-center font-black transition-all font-heading",
          done ? "bg-green-500 text-white" : active ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-300"
       )}>
          {done ? <CheckCircle className="w-6 h-6" /> : number}
       </div>
       <span className={cn(
          "text-xs font-black uppercase tracking-widest italic transition-all font-heading",
          done ? "text-green-500" : active ? "text-slate-950" : "text-slate-300"
       )}>
          {title}
       </span>
    </div>
  );
}

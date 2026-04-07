import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Zap, Download, Package, Settings, Code, CheckCircle, AlertCircle, Loader, Search, ChevronRight, ArrowLeft, GitBranch, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { QualityCheck, ValidationResult } from '../validation/QualityCheck';
import { ExportWizard } from '../export/ExportWizard';

interface AiGenerationRequest {
  vendor: string;
  moduleName: string;
  intent: string;
  referenceModuleIds: string[];
}

export const AiGeneratorWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [request, setRequest] = useState<AiGenerationRequest>({
    vendor: '',
    moduleName: '',
    intent: '',
    referenceModuleIds: [] as string[]
  });

  const [validationInfo, setValidationInfo] = useState<{ status: 'passed' | 'failed', results: ValidationResult[] } | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const { data: modules, isLoading: modulesLoading } = useQuery('modules-simple', async () => {
    const res = await api.get('/modules');
    return res.data;
  });

  const mutation = useMutation(async (data: typeof request) => {
    const response = await api.post('/generation/ai', data, {
      responseType: 'blob',
    });
    
    // Extract info from headers
    const status = response.headers['x-validation-status'] === 'passed' ? 'passed' : 'failed';
    const blockers = parseInt(response.headers['x-validation-blockers'] || '0');
    const errors = parseInt(response.headers['x-validation-errors'] || '0');
    const wsId = response.headers['x-workspace-id'];
    const mId = response.headers['x-module-id'];

    setWorkspaceId(wsId);
    setModuleId(mId);
    
    const mockResults: ValidationResult[] = [];
    if (blockers > 0) mockResults.push({ ruleId: 'V101', severity: 'BLOCKING_ERROR', message: `Detected ${blockers} critical structural issues.`, suggestion: 'Check registration.php and module.xml for identity alignment.' });
    if (errors > 0) mockResults.push({ ruleId: 'V203', severity: 'ERROR', message: `Detected ${errors} namespace mismatches.`, suggestion: 'Ensure PHP namespaces match the requested Vendor\\Module.' });

    setValidationInfo({ status, results: mockResults });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.vendor}_${data.moduleName}_AI.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  });

  const toggleReference = (id: string) => {
    setRequest(prev => ({
      ...prev,
      referenceModuleIds: prev.referenceModuleIds.includes(id)
        ? prev.referenceModuleIds.filter(rid => rid !== id)
        : [...prev.referenceModuleIds, id]
    }));
  };

  const isStep1Valid = request.vendor && request.moduleName && request.referenceModuleIds.length > 0;
  const isStep2Valid = request.intent.length > 20;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Zap className="p-1 w-10 h-10 bg-primary text-white rounded-lg" /> 
            Grounded AI Generator
          </h1>
          <p className="text-gray-400 mt-2">Generate modules based on internal patterns and existing registry code.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-full border border-gray-800">
            <div className={cn("px-4 py-1 rounded-full text-xs font-bold transition-all", step === 1 ? "bg-primary text-white" : "text-gray-500")}>1. Reference</div>
            <div className={cn("px-4 py-1 rounded-full text-xs font-bold transition-all", step === 2 ? "bg-primary text-white" : "text-gray-500")}>2. Intent</div>
            <div className={cn("px-4 py-1 rounded-full text-xs font-bold transition-all", mutation.isSuccess ? "bg-green-500 text-white" : "text-gray-500")}>3. Ready</div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Select Reference Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input className="pl-10" placeholder="Filter existing modules by name or capability..." />
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {modulesLoading ? (
                                    <div className="py-20 text-center"><Loader className="animate-spin inline-block mr-2" /> Loading registry...</div>
                                ) : (
                                    modules?.map((m: any) => (
                                        <div 
                                            key={m.id}
                                            onClick={() => toggleReference(m.id)}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between",
                                                request.referenceModuleIds.includes(m.id) 
                                                    ? "bg-primary/10 border-primary ring-1 ring-primary" 
                                                    : "bg-gray-900/40 border-gray-800 hover:border-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg", request.referenceModuleIds.includes(m.id) ? "bg-primary text-white" : "bg-gray-800 text-gray-500")}>
                                                    {m.name[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold">{m.vendor}_{m.name}</h4>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{m.description}</p>
                                                </div>
                                            </div>
                                            {request.referenceModuleIds.includes(m.id) && <CheckCircle className="text-primary w-5 h-5" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-widest text-gray-500">Identity Selection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400">Target Vendor</label>
                            <Input 
                                placeholder="e.g., Digitech" 
                                value={request.vendor}
                                onChange={e => setRequest({...request, vendor: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400">Target Module</label>
                            <Input 
                                placeholder="e.g., Rewards" 
                                value={request.moduleName}
                                onChange={e => setRequest({...request, moduleName: e.target.value})}
                            />
                        </div>
                        
                        <div className="pt-4 space-y-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Selected References ({request.referenceModuleIds.length})</h4>
                            <div className="flex flex-wrap gap-2">
                                {request.referenceModuleIds.map(id => {
                                    const m = modules?.find((mod: any) => mod.id === id);
                                    return <Badge key={id} variant="info" className="bg-primary/20 text-primary border-primary/30">{m?.name}</Badge>
                                })}
                                {request.referenceModuleIds.length === 0 && <p className="text-xs text-gray-600 italic">No references selected yet.</p>}
                            </div>
                        </div>

                        <Button 
                            fullWidth 
                            className="mt-6" 
                            disabled={!isStep1Valid}
                            onClick={() => setStep(2)}
                        >
                            Next Step: Define Intent <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

      {step === 2 && (
          <div className="max-w-3xl mx-auto space-y-6">
               <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to References
              </Button>

              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Describe Your Requirement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-2"><Zap className="w-4 h-4" /> Grounding Active</h4>
                          <p className="text-xs text-gray-400">Claude will prioritize coding patterns, class structures, and naming conventions from your {request.referenceModuleIds.length} selected reference modules.</p>
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm text-gray-400">What should this module do?</label>
                          <textarea 
                            className="w-full h-48 bg-gray-900 border border-gray-800 rounded-xl p-4 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Describe the business logic, external integrations, or specific features. e.g., 'Implement a loyalty program that gives customers 1 point for every $10 spent, with a custom totals block at checkout...'"
                            value={request.intent}
                            onChange={e => setRequest({...request, intent: e.target.value})}
                          />
                          <p className="text-xs text-gray-500 text-right">{request.intent.length}/20 characters minimum</p>
                      </div>

                      <Button 
                        fullWidth 
                        size="lg"
                        disabled={!isStep2Valid || mutation.isLoading}
                        onClick={() => mutation.mutate(request)}
                      >
                         {mutation.isLoading ? (
                            <><Loader className="animate-spin mr-2 w-5 h-5" /> Asking Claude to Architect & Generate...</>
                         ) : (
                            <><Download className="mr-2 w-5 h-5" /> Generate Augmented Module</>
                         )}
                      </Button>

                      {mutation.isError && (
                          <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-400 text-xs">
                              <AlertCircle className="w-5 h-5 shrink-0" /> AI Generation failed. This usually happens due to token limits or API connectivity.
                          </div>
                      )}
                      
                      {mutation.isSuccess && (
                          <div className="space-y-8">
                              <QualityCheck 
                                status={validationInfo?.status || 'passed'} 
                                results={validationInfo?.results || []} 
                              />

                              <div className="p-1.5 bg-gray-900/80 rounded-xl border border-gray-800 flex gap-2">
                                  <button 
                                      className={cn(
                                          "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                          !showExport ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                                      )}
                                      onClick={() => setShowExport(false)}
                                  >
                                      <CheckCircle className="w-4 h-4" /> Download Result
                                  </button>
                                  <button 
                                      className={cn(
                                          "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                          showExport ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                                      )}
                                      onClick={() => setShowExport(true)}
                                  >
                                      <GitBranch className="w-4 h-4" /> Publish to Git
                                  </button>
                              </div>

                              {!showExport ? (
                                  <div className="p-6 bg-green-950/20 border border-green-900/50 rounded-xl space-y-4">
                                      <div className="flex items-center gap-3 text-green-400 font-bold text-lg">
                                          <CheckCircle className="w-6 h-6" /> Generated! Ready for Final Review.
                                      </div>
                                      <p className="text-sm text-gray-400">Your ground-augmented Magento 2 module has been packaged and validated. You can find all the files inside the downloaded ZIP.</p>
                                      <div className="flex gap-4">
                                          <Button variant="secondary" onClick={() => setStep(1)}>Generate Another</Button>
                                          {!isSubmitted ? (
                                              <Button 
                                                className="bg-yellow-600 hover:bg-yellow-500 text-white gap-2 font-black"
                                                onClick={async () => {
                                                  await api.patch(`/governance/modules/${moduleId}/status`, { status: 'pending', reviewNote: 'Automated AI generation review requested.' });
                                                  setIsSubmitted(true);
                                                }}
                                              >
                                                <ShieldCheck className="w-4 h-4" /> Submit for Review
                                              </Button>
                                          ) : (
                                              <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                                                  <CheckCircle className="w-4 h-4" /> Submitted to Governance Gate
                                              </div>
                                          )}
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
                  </CardContent>
              </Card>
          </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from 'react-query';
import { 
  ArrowLeft, 
  Copy, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Package, 
  ChevronRight, 
  Shield,
  Zap,
  XCircle,
  GitBranch,
  ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { QualityCheck, ValidationResult } from '@/components/validation/QualityCheck';
import { ExportWizard } from '@/components/export/ExportWizard';
import { cn } from '@/lib/utils';

export default function CloneWizard() {
  const router = useRouter();
  const { id } = router.query;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    targetVendor: '',
    targetModule: '',
    description: '',
    version: '1.0.0',
  });
  const [validationInfo, setValidationInfo] = useState<{ status: 'passed' | 'failed', results: ValidationResult[] } | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: sourceModule, isLoading: moduleLoading } = useQuery(
    ['module', id],
    async () => {
      const res = await api.get(`/modules/${id}`);
      return res.data;
    },
    { enabled: !!id }
  );

  useEffect(() => {
    if (sourceModule) {
      setFormData(prev => ({
        ...prev,
        description: `Adapted from ${sourceModule.vendor}_${sourceModule.name}: ${sourceModule.description || ''}`,
      }));
    }
  }, [sourceModule]);

  const mutation = useMutation(async (data: typeof formData) => {
    const response = await api.post(`/clone-adapt/${id}`, {
      ...data,
      sourceVendor: sourceModule.vendor,
      sourceModule: sourceModule.name,
      targetNamespace: `${data.targetVendor}\\${data.targetModule}`,
    }, {
      responseType: 'blob',
    });

    // Extract info from headers
    const statusHeader = response.headers['x-validation-status'];
    const status: 'passed' | 'failed' = statusHeader === 'passed' ? 'passed' : 'failed';
    const blockers = parseInt(response.headers['x-validation-blockers'] || '0');
    const errors = parseInt(response.headers['x-validation-errors'] || '0');
    const wsId = response.headers['x-workspace-id'];
    const mId = response.headers['x-module-id'];

    setWorkspaceId(wsId);
    setModuleId(mId);

    const mockResults: ValidationResult[] = [];
    if (blockers > 0) mockResults.push({ ruleId: 'V101', severity: 'BLOCKING_ERROR', message: `Detected ${blockers} critical refactoring issues.`, suggestion: 'Ensure no source module identifiers were missed during transformation.' });
    if (errors > 0) mockResults.push({ ruleId: 'V203', severity: 'ERROR', message: `Detected ${errors} namespace anomalies.`, suggestion: 'Verify PHP namespace declarations match the new target identity.' });

    setValidationInfo({ status, results: mockResults });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.targetVendor}_${data.targetModule}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  });

  const isFormValid = formData.targetVendor && formData.targetModule;

  if (moduleLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <>
      <Head>
        <title>Clone & Adapt | 18th Module Registry</title>
      </Head>
      
      <div className="max-w-3xl mx-auto space-y-8 pb-20">
        <Link href="/library">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </Button>
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Copy className="text-primary w-8 h-8" /> Clone & Adapt
          </h1>
          <p className="text-gray-400">
            Create a new module based on <span className="text-white font-bold">{sourceModule?.vendor}_{sourceModule?.name}</span>
          </p>
        </div>

        {/* Wizard Steps */}
        <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <StepIndicator active={step === 1} done={step > 1} title="Identity" />
            <ChevronRight className="text-gray-700 w-4 h-4" />
            <StepIndicator active={step === 2} done={step > 2} title="Refactoring" />
            <ChevronRight className="text-gray-700 w-4 h-4" />
            <StepIndicator active={step === 3} done={mutation.isSuccess} title="Review" />
        </div>

        {step === 1 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> New Module Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">New Vendor</label>
                            <Input 
                                placeholder="PascalCase (e.g. PartnerCorp)" 
                                value={formData.targetVendor}
                                onChange={e => setFormData({...formData, targetVendor: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">New Module Name</label>
                            <Input 
                                placeholder="PascalCase (e.g. ElasticSearch)" 
                                value={formData.targetModule}
                                onChange={e => setFormData({...formData, targetModule: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-500 italic">Resulting Namespace: <span className="text-primary font-mono">{formData.targetVendor && formData.targetModule ? `${formData.targetVendor}\\${formData.targetModule}` : '---'}</span></p>
                    </div>
                    <Button 
                        disabled={!isFormValid} 
                        fullWidth 
                        size="lg" 
                        onClick={() => setStep(2)}
                    >
                        Continue to Refactoring <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        )}

        {step === 2 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> Adaptation Logic</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg space-y-3">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Automated Refactoring</h4>
                            <p className="text-xs text-gray-500 italic">The engine will recursively update:</p>
                            <ul className="text-xs text-gray-400 space-y-2">
                                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> PHP Namespaces & Class References</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> etc/module.xml Identifiers</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> registration.php Component Name</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> composer.json Metadata</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">New Description</label>
                            <Input 
                                placeholder="Briefly describe this adapted module" 
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <Button variant="ghost" fullWidth onClick={() => setStep(1)}>Back</Button>
                        <Button fullWidth onClick={() => setStep(3)}>Preview Adaptation</Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {step === 3 && (
            <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Safety Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-black/40 rounded-lg border border-gray-800 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                            <span className="text-sm text-gray-500">Source</span>
                            <span className="text-sm font-mono text-white">{sourceModule.vendor}_{sourceModule.name}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm text-gray-500">Target</span>
                            <span className="text-sm font-mono text-primary font-bold">{formData.targetVendor}_{formData.targetModule}</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                        By clicking "Execute Adaptation", the engine will clone the source repository, apply refactoring rules, and prepare a transformed ZIP package for you to download.
                    </p>

                    <div className="flex gap-4">
                        <Button variant="ghost" fullWidth onClick={() => setStep(2)}>Adjust Identity</Button>
                        <Button 
                            fullWidth 
                            size="lg"
                            className="shadow-xl shadow-primary/20"
                            onClick={() => mutation.mutate(formData)}
                            disabled={mutation.isLoading}
                        >
                            {mutation.isLoading ? (
                                <><Loader className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                                <><RotateCcw className="mr-2 h-4 w-4" /> Execute Adaptation</>
                            )}
                        </Button>
                    </div>

                    {mutation.isError && (
                        <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-400">
                             <AlertCircle className="w-5 h-5 shrink-0" /> Failed to adapt module. Check repository accessibility.
                        </div>
                    )}

                    {mutation.isSuccess && (
                        <div className="space-y-6">
                            <QualityCheck 
                                status={validationInfo?.status || 'passed'} 
                                results={validationInfo?.results || []} 
                            />

                            <div className="p-1 bg-gray-900 border border-gray-800 rounded-xl flex gap-2">
                                <button 
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                        !showExport ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                                    )}
                                    onClick={() => setShowExport(false)}
                                >
                                    <CheckCircle className="w-4 h-4" /> Final Summary
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
                                <div className="p-4 bg-green-950/20 border border-green-900/50 rounded-lg space-y-3 shadow-lg shadow-green-500/10">
                                    <div className="flex items-center gap-3 text-green-400 font-bold">
                                        <CheckCircle className="w-5 h-5 shrink-0" /> Transformation Successful!
                                    </div>
                                    <p className="text-sm text-gray-400">Your module has been adapted and validated. The ZIP package containing the refactored code has been downloaded.</p>
                                     <div className="flex gap-4">
                                        <Button variant="secondary" size="sm" onClick={() => router.push('/library')}>Return to Library</Button>
                                        {!isSubmitted ? (
                                            <Button 
                                                size="sm"
                                                className="bg-yellow-600 hover:bg-yellow-500 text-white gap-2 font-black"
                                                onClick={async () => {
                                                    await api.patch(`/governance/modules/${moduleId}/status`, { status: 'pending', reviewNote: 'Cloned and adapted module review requested.' });
                                                    setIsSubmitted(true);
                                                }}
                                            >
                                                <ShieldCheck className="w-4 h-4" /> Submit for Review
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm bg-yellow-500/10 px-4 py-1 rounded-lg border border-yellow-500/20">
                                                <CheckCircle className="w-4 h-4" /> Submitted for Review
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <ExportWizard 
                                    workspaceId={workspaceId || ''} 
                                    type="clone" 
                                    className="animate-in fade-in zoom-in-95 duration-300"
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </>
  );
}

function StepIndicator({ active, done, title }: { active: boolean; done: boolean; title: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                done ? "bg-green-500 text-white" : active ? "bg-primary text-white" : "bg-gray-800 text-gray-500"
            }`}>
               {done ? <CheckCircle className="w-4 h-4" /> : null}
               {!done ? title[0] : null}
            </div>
            <span className={`text-sm font-semibold transition-colors ${active || done ? "text-white" : "text-gray-600"}`}>{title}</span>
        </div>
    );
}

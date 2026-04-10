import React, { useState } from 'react';
import Head from 'next/head';
import { useMutation } from 'react-query';
import { Zap, Download, Package, Settings, Code, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

export default function Generator() {
  const [options, setOptions] = useState({
    vendor: '',
    moduleName: '',
    description: '',
    version: '1.0.0',
    components: {
      frontendController: true,
      adminController: false,
      dbSchema: true,
      plugin: false,
      observer: false,
    }
  });

  const mutation = useMutation(async (data: typeof options) => {
    const response = await api.post('/generation/zip', data, {
      responseType: 'blob',
    });
    
    // Create a download link for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.vendor}_${data.moduleName}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  });

  const handleComponentToggle = (key: keyof typeof options.components) => {
    setOptions(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: !prev.components[key]
      }
    }));
  };

  const isFormValid = options.vendor && options.moduleName && options.description;

  return (
    <>
      <Head>
        <title>AI Generator | 18th Module Registry</title>
      </Head>
      
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter flex items-center gap-4 italic font-heading uppercase">
              <Zap className="w-12 h-12 text-primary fill-primary/20" /> BOILERPLATE GEN
            </h1>
            <p className="text-slate-500 font-medium italic">Generate standardized Magento 2 architectural skeletons in seconds.</p>
          </div>
          {mutation.isSuccess && (
            <Badge variant="info" className="py-2 px-6 bg-green-50 text-green-600 border-green-100 flex items-center gap-2 animate-in zoom-in-95">
               <CheckCircle className="w-4 h-4" /> Protocol Success
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Card className="p-0 overflow-hidden shadow-premium border-slate-100">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 italic">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-heading">Module Identity</h3>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic font-heading">Vendor Name</label>
                    <Input 
                      placeholder="e.g., Digitech" 
                      value={options.vendor}
                      onChange={e => setOptions({...options, vendor: e.target.value})}
                      className="bg-slate-50/50 border-slate-100 h-14"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic font-heading">Module Name</label>
                    <Input 
                      placeholder="e.g., CheckoutCustomizer" 
                      value={options.moduleName}
                      onChange={e => setOptions({...options, moduleName: e.target.value})}
                      className="bg-slate-50/50 border-slate-100 h-14"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic font-heading">Operational Description</label>
                  <Input 
                    placeholder="Short summary of architectural role" 
                    value={options.description}
                    onChange={e => setOptions({...options, description: e.target.value})}
                    className="bg-slate-50/50 border-slate-100 h-14"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="p-0 overflow-hidden shadow-premium border-slate-100">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 italic">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-heading">Core Components</h3>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <ComponentToggle 
                    label="Frontend Controller" 
                    checked={options.components.frontendController}
                    onChange={() => handleComponentToggle('frontendController')}
                  />
                  <ComponentToggle 
                    label="Admin Controller" 
                    checked={options.components.adminController}
                    onChange={() => handleComponentToggle('adminController')}
                  />
                  <ComponentToggle 
                    label="DB Schema (db_schema.xml)" 
                    checked={options.components.dbSchema}
                    onChange={() => handleComponentToggle('dbSchema')}
                  />
                  <ComponentToggle 
                    label="Plugin (di.xml)" 
                    checked={options.components.plugin}
                    onChange={() => handleComponentToggle('plugin')}
                  />
                  <ComponentToggle 
                    label="Observer (events.xml)" 
                    checked={options.components.observer}
                    onChange={() => handleComponentToggle('observer')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-slate-950 text-white shadow-2xl border-none sticky top-24 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest italic text-white font-heading">Operational Summary</h4>
              </div>
              
              <div className="space-y-4">
                <SummaryItem label="Namespace" value={options.vendor && options.moduleName ? `${options.vendor}_${options.moduleName}` : '---'} />
                <SummaryItem label="Core Target" value="Magento v2.4.x" />
                <SummaryItem label="Modules" value={`${Object.values(options.components).filter(Boolean).length} Artifacts`} />
              </div>

              <div className="pt-4 space-y-4">
                <Button 
                   fullWidth 
                   size="lg" 
                   variant="glow"
                   disabled={!isFormValid || mutation.isLoading}
                   onClick={() => mutation.mutate(options)}
                   className="h-16 shadow-2xl shadow-primary/20"
                >
                  {mutation.isLoading ? (
                    <><Loader className="w-5 h-5 animate-spin mr-3" /> Initializing...</>
                  ) : (
                    <><Download className="w-5 h-5 mr-3" /> Generate Package</>
                  )}
                </Button>

                {mutation.isError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest italic animate-bounce">
                    <AlertCircle className="w-4 h-4 shrink-0" /> Failed to materialize package.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-heading">{label}</span>
      <span className="text-sm font-bold text-white tracking-tight">{value}</span>
    </div>
  );
}

function ComponentToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div 
      onClick={onChange}
      className={cn(
        "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all",
        checked ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" : "bg-white border-slate-100 text-slate-500 hover:border-primary/20 group"
      )}
    >
      <span className={cn("text-xs font-black uppercase tracking-tight italic", checked ? "text-white" : "group-hover:text-primary transition-colors font-heading")}>{label}</span>
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all",
        checked ? "bg-white text-primary border-white" : "bg-slate-50 border-slate-100"
      )}>
        {checked && <CheckCircle className="w-4 h-4" />}
      </div>
    </div>
  );
}

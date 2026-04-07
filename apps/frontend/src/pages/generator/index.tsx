import React, { useState } from 'react';
import Head from 'next/head';
import { useMutation } from 'react-query';
import { Zap, Download, Package, Settings, Code, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

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
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary fill-primary/20" /> AI Module Generator
            </h1>
            <p className="text-gray-400 mt-1">Generate high-quality Magento 2 boilerplate code instantly.</p>
          </div>
          {mutation.isSuccess && (
            <div className="flex items-center gap-2 text-green-400 bg-green-950/20 px-4 py-2 rounded-full border border-green-900/50">
               <CheckCircle className="w-4 h-4" /> Module Generated
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Module Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Vendor Name</label>
                    <Input 
                      placeholder="e.g., Digitech" 
                      value={options.vendor}
                      onChange={e => setOptions({...options, vendor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Module Name</label>
                    <Input 
                      placeholder="e.g., CheckoutCustomizer" 
                      value={options.moduleName}
                      onChange={e => setOptions({...options, moduleName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Description</label>
                  <Input 
                    placeholder="Short summary of what the module does" 
                    value={options.description}
                    onChange={e => setOptions({...options, description: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" /> Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <Checkbox 
                    label="Frontend Controller" 
                    checked={options.components.frontendController}
                    onChange={() => handleComponentToggle('frontendController')}
                  />
                  <Checkbox 
                    label="Admin Controller" 
                    checked={options.components.adminController}
                    onChange={() => handleComponentToggle('adminController')}
                  />
                  <Checkbox 
                    label="DB Schema (db_schema.xml)" 
                    checked={options.components.dbSchema}
                    onChange={() => handleComponentToggle('dbSchema')}
                  />
                  <Checkbox 
                    label="Plugin (di.xml)" 
                    checked={options.components.plugin}
                    onChange={() => handleComponentToggle('plugin')}
                  />
                  <Checkbox 
                    label="Observer (events.xml)" 
                    checked={options.components.observer}
                    onChange={() => handleComponentToggle('observer')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Namespace</span>
                    <span className="text-white font-mono">{options.vendor && options.moduleName ? `${options.vendor}_${options.moduleName}` : '---'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Magento Version</span>
                    <span className="text-white">v2.4.x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Components</span>
                    <span className="text-white">{Object.values(options.components).filter(Boolean).length} Selected</span>
                  </div>
                </div>

                <Button 
                   fullWidth 
                   size="lg" 
                   disabled={!isFormValid || mutation.isLoading}
                   onClick={() => mutation.mutate(options)}
                   className="gap-2 shadow-lg shadow-primary/20"
                >
                  {mutation.isLoading ? (
                    <><Loader className="w-5 h-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Download className="w-5 h-5" /> Generate Module ZIP</>
                  )}
                </Button>

                {mutation.isError && (
                  <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" /> Failed to generate. Please check your inputs.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

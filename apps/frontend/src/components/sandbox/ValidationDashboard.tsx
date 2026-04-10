import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Search,
  Zap,
  Layout
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface ValidationResult {
  status: 'passed' | 'failed' | 'warning';
  checks: Array<{
    name: string;
    status: 'passed' | 'failed' | 'warning';
    message?: string;
    details?: any;
  }>;
  summary: string;
}

interface ValidationDashboardProps {
  results?: ValidationResult;
  isLoading?: boolean;
}

export const ValidationDashboard: React.FC<ValidationDashboardProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-50 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="space-y-8">
      {/* Verdict Card */}
      <Card className={cn(
        "rounded-[2.5rem] overflow-hidden border-2",
        results.status === 'passed' ? "border-green-100 bg-green-50/30" :
        results.status === 'failed' ? "border-red-100 bg-red-50/30" :
        "border-amber-100 bg-amber-50/30"
      )}>
        <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8">
           <div className={cn(
             "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-105",
             results.status === 'passed' ? "bg-green-500 text-white" :
             results.status === 'failed' ? "bg-red-500 text-white" :
             "bg-amber-500 text-white"
           )}>
             {results.status === 'passed' ? <CheckCircle className="w-10 h-10" /> :
              results.status === 'failed' ? <XCircle className="w-10 h-10" /> :
              <AlertCircle className="w-10 h-10" />}
           </div>
           <div className="space-y-2 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                   Module Validation {results.status.toUpperCase()}
                 </h2>
                 <Badge variant={results.status === 'passed' ? 'success' : results.status === 'failed' ? 'danger' : 'warning'} className="font-black italic shadow-sm">
                    {results.status === 'passed' ? 'Production Ready' : 'Issues Detected'}
                 </Badge>
              </div>
              <p className="text-slate-500 font-medium italic text-lg leading-relaxed">{results.summary}</p>
           </div>
        </CardContent>
      </Card>

      {/* Detailed Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.checks.map((check, idx) => (
          <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group flex items-start gap-4">
             <div className={cn(
               "p-3 rounded-2xl flex-shrink-0 transition-colors",
               check.status === 'passed' ? "bg-green-50 text-green-500" :
               check.status === 'failed' ? "bg-red-50 text-red-500" :
               "bg-amber-50 text-amber-500"
             )}>
                {check.status === 'passed' ? <CheckCircle className="w-5 h-5" /> :
                 check.status === 'failed' ? <XCircle className="w-5 h-5" /> :
                 <AlertCircle className="w-5 h-5" />}
             </div>
             <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h4 className="font-black text-slate-800 uppercase tracking-tight italic text-sm">{check.name}</h4>
                   <Badge variant="default" className="text-[9px] bg-slate-50 text-slate-400 font-black italic">Automated</Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium italic leading-snug">{check.message}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Manual Inspection Hub */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Layout className="w-48 h-48 -mr-12 -mt-12" />
         </div>
         <div className="relative z-10 space-y-6">
            <div className="space-y-2">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter">Manual Inspection Hub</h3>
               <p className="text-slate-400 font-medium italic leading-relaxed max-w-2xl">
                  Automated checks passed, but real-world confidence requires eyes on the frontend. Use the ephemeral URLs below to access the containerized Magento instance.
               </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <button className="flex items-center gap-3 px-6 py-4 bg-primary text-black font-black uppercase italic rounded-2xl hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                  <ExternalLink className="w-5 h-5" /> Open Storefront
               </button>
               <button className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase italic rounded-2xl border border-white/10 transition-all active:scale-[0.98]">
                  <Database className="w-5 h-5" /> Admin Panel
               </button>
               <button className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase italic rounded-2xl border border-white/10 transition-all active:scale-[0.98]">
                  <Search className="w-5 h-5" /> Log Explorer
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

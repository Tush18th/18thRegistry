import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValidationSeverity = 'BLOCKING_ERROR' | 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationResult {
  ruleId: string;
  severity: ValidationSeverity;
  message: string;
  file?: string;
  context?: string;
  suggestion?: string;
}

interface QualityCheckProps {
  status: 'passed' | 'failed';
  results: ValidationResult[];
  className?: string;
}

export const QualityCheck: React.FC<QualityCheckProps> = ({ status, results, className }) => {
  const blockers = results.filter(r => r.severity === 'BLOCKING_ERROR');
  const errors = results.filter(r => r.severity === 'ERROR');
  const warnings = results.filter(r => r.severity === 'WARNING');

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Summary */}
      <div className={cn(
        "p-6 rounded-2xl border flex items-center justify-between shadow-lg",
        status === 'passed' 
          ? "bg-green-500/10 border-green-500/30 text-green-400" 
          : "bg-red-500/10 border-red-500/30 text-red-400"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            status === 'passed' ? "bg-green-500 text-white" : "bg-red-500 text-white"
          )}>
            {status === 'passed' ? <ShieldCheck className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Quality Gate: {status === 'passed' ? 'Passed' : 'Failed'}
            </h3>
            <p className="text-sm opacity-80">
              {results.length === 0 
                ? "Perfect score! No issues detected." 
                : `Detected ${blockers.length} blockers, ${errors.length} errors, and ${warnings.length} warnings.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {results.length > 0 ? (
          results.map((res, i) => (
            <div 
              key={`${res.ruleId}-${i}`}
              className={cn(
                "p-4 rounded-xl border flex flex-col gap-3 transition-all hover:translate-x-1",
                res.severity === 'BLOCKING_ERROR' ? "bg-red-950/20 border-red-900/50" :
                res.severity === 'ERROR' ? "bg-orange-950/20 border-orange-900/50" :
                "bg-yellow-950/20 border-yellow-900/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {res.severity === 'BLOCKING_ERROR' && <XCircle className="w-5 h-5 text-red-500" />}
                    {res.severity === 'ERROR' && <AlertCircle className="w-5 h-5 text-orange-500" />}
                    {res.severity === 'WARNING' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                       {res.message}
                       <span className="text-[10px] font-mono opacity-40 px-1.5 py-0.5 bg-white/5 rounded">{res.ruleId}</span>
                    </h4>
                    {res.file && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 font-mono">
                        <FileText className="w-3 h-3" /> {res.file}
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded",
                  res.severity === 'BLOCKING_ERROR' ? "bg-red-500 text-white" :
                  res.severity === 'ERROR' ? "bg-orange-500 text-white" :
                  "bg-yellow-500 text-black"
                )}>
                  {res.severity.replace('_', ' ')}
                </div>
              </div>

              {res.suggestion && (
                <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-300">
                    <span className="font-bold text-primary mr-1">Suggestion:</span>
                    {res.suggestion}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center border border-dashed border-gray-800 rounded-2xl">
             <CheckCircle className="w-12 h-12 text-green-500/20 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">Standard structural validation completed with zero issues.</p>
          </div>
        )}
      </div>
    </div>
  );
};

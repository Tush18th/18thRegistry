import React from 'react';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { SandboxStatus } from '@/types/sandbox';
import { cn } from '@/lib/utils';

interface StageStepperProps {
  currentStatus: SandboxStatus;
}

const STAGES = [
  { key: 'provisioning', label: 'Infrastructure', statuses: [SandboxStatus.REQUESTED, SandboxStatus.ANALYZING, SandboxStatus.PROVISIONING] },
  { key: 'bootstrap', label: 'Magento Bootstrap', statuses: [SandboxStatus.BOOTSTRAPPING] },
  { key: 'install', label: 'Module Install', statuses: [SandboxStatus.INSTALLING] },
  { key: 'validate', label: 'Validation', statuses: [SandboxStatus.VALIDATING] },
  { key: 'ready', label: 'Live Storefront', statuses: [SandboxStatus.RUNNING, SandboxStatus.AWAITING_APPROVAL, SandboxStatus.TERMINATING, SandboxStatus.TERMINATED] },
];

export const StageStepper: React.FC<StageStepperProps> = ({ currentStatus }) => {
  const getStageIndex = (status: SandboxStatus) => {
    return STAGES.findIndex(s => s.statuses.includes(status));
  };

  const currentIndex = getStageIndex(currentStatus);
  const isFailed = currentStatus === SandboxStatus.FAILED;

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-4 py-12">
      {STAGES.map((stage, idx) => {
        const isCompleted = !isFailed && idx < currentIndex;
        const isActive = !isFailed && idx === currentIndex;
        const isPending = idx > currentIndex;
        const stageFailed = isFailed && idx === currentIndex;

        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                isCompleted ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" :
                isActive ? "bg-white border-primary text-primary shadow-xl shadow-primary/10" :
                stageFailed ? "bg-red-500 border-red-500 text-white" :
                "bg-slate-50 border-slate-100 text-slate-300"
              )}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                 isActive ? <Loader2 className="w-6 h-6 animate-spin" /> :
                 stageFailed ? <AlertCircle className="w-6 h-6" /> :
                 <Circle className="w-6 h-6 fill-current opacity-20" />}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap",
                isActive ? "text-slate-900" : "text-slate-400"
              )}>
                {stage.label}
              </span>
            </div>
            
            {idx < STAGES.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 -mt-8 bg-slate-100 relative group overflow-hidden">
                <div 
                  className={cn(
                    "absolute inset-0 bg-primary transition-all duration-1000",
                    isCompleted ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

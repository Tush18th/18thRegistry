import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Trash2, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useApproveTeardown, useExtendSandbox } from '@/hooks/use-sandbox';
import { SandboxStatus } from '@/types/sandbox';
import { cn } from '@/lib/utils';

interface TeardownBannerProps {
  sessionId: string;
  status: SandboxStatus;
  expiresAt: string;
}

export const TeardownBanner: React.FC<TeardownBannerProps> = ({ sessionId, status, expiresAt }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1);
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const approveTeardown = useApproveTeardown();
  const extendSandbox = useExtendSandbox();

  const isAwaitingApproval = status === SandboxStatus.AWAITING_APPROVAL;
  const timeRemainingMs = new Date(expiresAt).getTime() - now.getTime();
  const minutes = Math.max(0, Math.floor(timeRemainingMs / 60000));
  const seconds = Math.max(0, Math.floor((timeRemainingMs % 60000) / 1000));
  
  // Show banner only if < 15 mins or awaiting approval
  if (status !== SandboxStatus.RUNNING && !isAwaitingApproval) return null;
  if (minutes > 15 && !isAwaitingApproval) return null;

  return (
    <>
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "sticky top-20 z-40 mx-4 mt-4 p-4 rounded-[2rem] border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden transition-colors duration-500",
          isAwaitingApproval 
            ? "bg-red-600 border-red-500 text-white animate-pulse" 
            : "bg-amber-500 border-amber-400 text-white"
        )}
      >
        <div className="flex items-center gap-6">
           <div className={cn(
             "p-3 rounded-2xl transition-colors",
             isAwaitingApproval ? "bg-white text-red-600" : "bg-white/20"
           )}>
              {isAwaitingApproval ? <ShieldAlert className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
           </div>
           <div className="space-y-0.5">
              <h4 className="text-sm font-black uppercase tracking-tight italic">
                 {isAwaitingApproval ? 'Action Required: Termination Imminent' : 'Destruction Scheduled'}
              </h4>
              <p className="text-[11px] font-bold opacity-80 italic flex items-center gap-2">
                 {isAwaitingApproval 
                    ? 'Confirm destruction or request more time now to prevent automatic teardown.' 
                    : `Sandbox environment will be reclaimed automatically.`}
                 <span className="bg-black/20 px-2 py-0.5 rounded-md font-mono text-[10px]">
                    {minutes}:{seconds.toString().padStart(2, '0')} remaining
                 </span>
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <Button 
             onClick={() => setIsModalOpen(true)}
             className="bg-white text-slate-900 font-black uppercase italic text-xs h-10 px-6 rounded-xl hover:bg-slate-100 transition-all"
           >
              Extend Session
           </Button>
           <Button 
             onClick={() => approveTeardown.mutate({ id: sessionId })}
             disabled={approveTeardown.isLoading}
             className="bg-black text-white font-black uppercase italic text-xs h-10 px-6 rounded-xl hover:bg-black/80 transition-all border border-black/20"
           >
              Destroy Now
           </Button>
        </div>
      </motion.div>

      {/* Extension Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Extend Validation</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
               </div>

               <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                     Select additional retention time. Extensions are capped at 4 hours total per session.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3">
                     {[1, 2, 4].map(hours => (
                        <button 
                          key={hours}
                          onClick={() => setExtensionHours(hours)}
                          className={cn(
                            "p-4 rounded-2xl border-2 font-black italic transition-all",
                            extensionHours === hours ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200 text-slate-400"
                          )}
                        >
                           +{hours}h
                        </button>
                     ))}
                  </div>
               </div>

               <Button 
                 fullWidth 
                 className="h-14 font-black uppercase italic rounded-2xl bg-slate-900 text-white"
                 onClick={() => {
                    extendSandbox.mutate({ id: sessionId, extensionHours });
                    setIsModalOpen(false);
                 }}
               >
                  Confirm Extension
               </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

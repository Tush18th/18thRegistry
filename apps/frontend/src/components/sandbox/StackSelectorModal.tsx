import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Check, 
  Info, 
  AlertTriangle,
  Play,
  Loader,
  BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useStackProfiles, useLaunchSandbox } from '@/hooks/use-sandbox';
import { useCompatibilityRecommendation } from '@/hooks/use-compatibility';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface StackSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
}

export const StackSelectorModal: React.FC<StackSelectorModalProps> = ({ isOpen, onClose, moduleId }) => {
  const router = useRouter();
  const { data: profiles, isLoading: profilesLoading } = useStackProfiles();
  const { data: reco } = useCompatibilityRecommendation(moduleId);
  const launchSandbox = useLaunchSandbox();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Auto-select recommended profile when data loads
  React.useEffect(() => {
    if (profiles && reco?.magentoRecommendation?.recommended) {
      const match = profiles.find(p => p.magentoVersion === reco.magentoRecommendation?.recommended);
      if (match) setSelectedProfileId(match.id);
      else if (profiles.length > 0) setSelectedProfileId(profiles[0].id);
    } else if (profiles && profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, reco, selectedProfileId]);

  const handleLaunch = async () => {
    if (!selectedProfileId) return;

    try {
      const result = await launchSandbox.mutateAsync({
        moduleId,
        stackProfileId: selectedProfileId,
      });
      onClose();
      router.push(`/sandboxes/${result.sessionId}`);
    } catch (err) {
      console.error('Launch failed', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">Select Test Environment</h3>
                  <p className="text-sm text-slate-500 font-medium italic">Choose the Magento stack profile for your validation session.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stack List */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {profilesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />)}
                  </div>
                ) : (
                  profiles?.map((profile) => {
                    const isSelected = selectedProfileId === profile.id;
                    const isRecommended = profile.magentoVersion === reco?.magentoRecommendation?.recommended;

                    return (
                      <div 
                        key={profile.id}
                        onClick={() => setSelectedProfileId(profile.id)}
                        className={cn(
                          "relative p-6 border-2 rounded-3xl cursor-pointer transition-all group",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-3 rounded-2xl transition-colors",
                              isSelected ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-white"
                            )}>
                              <Server className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 uppercase tracking-tight italic">Magento {profile.magentoVersion}</h4>
                                {isRecommended && (
                                  <Badge variant="success" className="font-black italic text-[10px] uppercase tracking-widest gap-1">
                                    <BadgeCheck className="w-3 h-3" /> Recommended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-medium italic">
                                PHP {profile.phpVersion} • {profile.dbVersion} • {profile.searchEngine}
                              </p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected ? "bg-primary border-primary text-white" : "border-slate-200"
                          )}>
                            {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Policy & Info */}
              <div className="p-4 bg-slate-50 rounded-2xl flex gap-4 items-start border border-slate-100">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                  Ephemeral sandboxes are provisioned for <span className="text-slate-900 font-bold uppercase tracking-tight">60 minutes</span>. You will receive a destruction alert 10 minutes prior to expiration.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={onClose}
                  className="font-bold uppercase h-14 rounded-2xl border-slate-200 italic"
                >
                  Cancel
                </Button>
                <Button 
                  fullWidth 
                  disabled={!selectedProfileId || launchSandbox.isLoading}
                  onClick={handleLaunch}
                  className="h-14 bg-slate-900 text-white font-black uppercase italic shadow-xl shadow-slate-900/10 rounded-2xl gap-2 active:scale-[0.98]"
                >
                  {launchSandbox.isLoading ? (
                    <><Loader className="animate-spin w-5 h-5" /> Initializing...</>
                  ) : (
                    <><Play className="w-5 h-5 fill-current" /> Launch Sandbox</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Search, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCompatibilityRecommendation } from '@/hooks/use-compatibility';
import { ConfidenceLevel } from '@/types/compatibility';
import { cn } from '@/lib/utils';

interface CompatibilityPanelProps {
  moduleId: string;
}

export const CompatibilityPanel: React.FC<CompatibilityPanelProps> = ({ moduleId }) => {
  const { data: reco, isLoading, error } = useCompatibilityRecommendation(moduleId, { enabled: !!moduleId });

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-100 shadow-sm animate-pulse">
        <CardContent className="p-6 space-y-4">
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-20 bg-slate-50 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (error || !reco) {
    return (
      <Card className="bg-white border-slate-100 shadow-sm">
        <CardContent className="p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 italic font-medium">Compatibility analysis not yet available for this module.</p>
        </CardContent>
      </Card>
    );
  }

  const confidenceColor = reco.confidenceScore?.level === ConfidenceLevel.STRONG_INFERENCE || reco.confidenceScore?.level === ConfidenceLevel.EXPLICIT
    ? 'text-green-500'
    : 'text-amber-500';

  return (
    <Card className="bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-[2rem]">
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Compatibility Score</span>
        </div>
        <Badge variant={reco.confidenceScore?.score && reco.confidenceScore.score > 80 ? 'success' : 'warning'} className="font-black italic shadow-sm">
          {reco.confidenceScore?.score || 0}% Confident
        </Badge>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Primary Recommendations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Magento</span>
            <p className="text-lg font-black text-slate-900 tracking-tighter italic">
              {reco.magentoRecommendation?.recommended || 'Unknown'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">PHP</span>
            <p className="text-lg font-black text-slate-900 tracking-tighter italic">
              {reco.phpRecommendation?.recommended || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Infrastructure & Services */}
        {reco.infrastructure && reco.infrastructure.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic flex items-center gap-2">
              <Zap className="w-3 h-3" /> Required Services
            </h4>
            <div className="flex flex-wrap gap-2">
              {reco.infrastructure.map((infra, idx) => (
                <Badge key={idx} variant="info" className="bg-blue-50 text-blue-600 border-blue-100 font-bold italic py-1 px-3 rounded-full">
                  {infra.service} ({infra.requirement.toLowerCase()})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {reco.warnings && reco.warnings.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> Technical Alerts
            </h4>
            <div className="space-y-2">
              {reco.warnings.map((warning, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-red-50/50 rounded-xl border border-red-50 text-red-600">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold leading-tight italic">{warning.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!reco.warnings?.length && reco.status === 'completed' && (
          <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl border border-green-50 text-green-600">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-xs font-black uppercase tracking-tight italic">AI Analysis Passed: High reusability likelihood.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

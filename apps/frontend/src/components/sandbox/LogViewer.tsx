import React, { useRef, useEffect } from 'react';
import { Terminal, Download, Search, ChevronDown, ListFilter } from 'lucide-react';
import { SandboxEvent } from '@/types/sandbox';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface LogViewerProps {
  events: SandboxEvent[];
  isStreaming?: boolean;
}

export const LogViewer: React.FC<LogViewerProps> = ({ events, isStreaming }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, isStreaming]);

  return (
    <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[500px]">
      {/* Console Header */}
      <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2 border-l border-slate-700 pl-3">
            <Terminal className="w-3 h-3 text-primary" /> Orchestration Console
          </span>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
               <ListFilter className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
               <Download className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Log Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-2 selection:bg-primary/30 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
             <Terminal className="w-12 h-12 text-slate-400" />
             <p className="text-xs font-black uppercase tracking-widest italic">Initializing stream...</p>
          </div>
        ) : (
          events.map((event, idx) => (
            <div key={event.id || idx} className="group flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-slate-600 shrink-0 w-24 text-[10px] pt-1">
                {new Date(event.createdAt).toLocaleTimeString([], { hour12: false })}
              </span>
              <div className="space-y-1 flex-1">
                <p className={cn(
                  "leading-relaxed break-all",
                  event.type === 'runtime_error' ? "text-red-400 font-bold" : "text-slate-300"
                )}>
                  <span className="text-primary/50 mr-2">$</span>
                  {event.message}
                </p>
                {event.details && (
                  <pre className="mt-2 p-3 bg-slate-950/50 rounded-xl text-[10px] text-slate-500 border border-slate-800 overflow-x-auto">
                    {JSON.stringify(event.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-950/50 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Live Streaming</span>
            </div>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight italic">
               {events.length} Events Logged
            </span>
         </div>
         <button 
           onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
           className="text-[10px] font-black uppercase text-primary tracking-widest italic flex items-center gap-1 hover:brightness-125"
         >
            Scroll to Bottom <ChevronDown className="w-3 h-3" />
         </button>
      </div>
    </div>
  );
};

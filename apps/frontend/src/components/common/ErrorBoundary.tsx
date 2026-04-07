import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed animate-in fade-in duration-500">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-500">
               <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Something went wrong</h2>
               <p className="text-gray-500 text-sm leading-relaxed">
                  The dashboard encountered an unexpected error. Don't worry, your data and generated modules are safe.
               </p>
            </div>
            <div className="pt-4">
               <Button 
                 onClick={() => window.location.reload()}
                 className="bg-primary text-black font-black uppercase italic h-12 px-8"
               >
                  <RefreshCw className="mr-2 w-4 h-4" /> Restart Experience
               </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
               <pre className="text-[10px] text-gray-700 bg-black/40 p-4 rounded-xl text-left overflow-auto max-h-40 font-mono">
                  {this.state.error?.toString()}
               </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

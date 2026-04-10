import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Sparkles, Loader2, ShieldCheck, Mail, Lock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      await login(res.data.accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-primary/20">
      <Head>
        <title>Login | 18th Module Registry</title>
      </Head>

      {/* Grid & Decorative Aura */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[35%] h-[35%] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex p-5 rounded-3xl bg-white border border-slate-100 mb-2 shadow-premium animate-bounce-slow">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-black text-slate-950 tracking-tighter uppercase font-heading italic">
             Archive <br/><span className="text-primary not-italic">Identity.</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Secure entry protocol for 18th Module Registry.</p>
        </div>

        <Card className="p-0 overflow-hidden border-slate-100 shadow-premium">
          <div className="h-2 bg-primary w-full" />
          
          <div className="p-10 md:p-14">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 text-sm animate-in slide-in-from-top-2">
                  <Activity className="w-5 h-5 shrink-0" />
                  <p className="font-black tracking-tight uppercase italic">{error}</p>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity: Email</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-primary transition-colors duration-300" />
                    <Input
                      type="email"
                      placeholder="admin@18th-digitech.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 h-14 pl-12 rounded-xl focus:ring-primary/20 focus:border-primary transition-all duration-500 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Protocol: Password</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-primary transition-colors duration-300" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 h-14 pl-12 rounded-xl focus:ring-primary/20 focus:border-primary transition-all duration-500 font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                variant="glow"
                size="lg"
                className="h-16 shadow-2xl"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-heading">Synchronizing...</span>
                  </div>
                ) : (
                  <span className="font-heading">Initialize Protocol</span>
                )}
              </Button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-50 text-center">
               <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">
                    Security Layer L4 Active
                  </p>
               </div>
               <p className="text-[8px] text-slate-300 uppercase font-mono">
                 © 18TH DIGITECH ARCHITECTURAL OPS 2024
               </p>
            </div>
          </div>
        </Card>
      </div>
      
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

// Disable layout for this page
LoginPage.getLayout = (page: React.ReactNode) => page;

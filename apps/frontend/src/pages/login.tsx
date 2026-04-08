import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 selection:bg-primary/30">
      <Head>
        <title>Login | 18th Module Registry</title>
      </Head>

      {/* Decorative Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500 hover:scale-[1.01]">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4 animate-bounce-slow">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
             Registry Access
          </h1>
          <p className="text-gray-500 font-medium italic">Secure login for 18th Digitech platform.</p>
        </div>

        <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
          {/* Subtle line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm animate-in slide-in-from-top-2 duration-300">
                  <ShieldCheck className="w-5 h-5 shrink-0 rotate-180" />
                  <p className="font-medium tracking-tight italic uppercase">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Identity: Email</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-primary transition-colors duration-300" />
                    <Input
                      type="email"
                      placeholder="admin@18th-digitech.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-black/40 border-gray-800 h-14 pl-12 rounded-xl focus:ring-primary/20 focus:border-primary transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Protocol: Password</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-primary transition-colors duration-300" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-black/40 border-gray-800 h-14 pl-12 rounded-xl focus:ring-primary/20 focus:border-primary transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                size="lg"
                className="h-14 bg-primary hover:bg-primary/90 text-black font-black uppercase italic tracking-wider shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synchronizing...</span>
                  </div>
                ) : (
                  "Initiate Session"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-800 text-center">
              <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                Protected by 18th Digitech Security Protocol v1.0
              </p>
            </div>
          </CardContent>
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

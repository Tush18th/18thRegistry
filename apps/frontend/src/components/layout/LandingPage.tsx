import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Search, 
  Library, 
  Sparkles,
  ArrowRight,
  Database,
  Terminal,
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden selection:bg-primary/20">
      <Head>
        <title>18th Digitech | Registry Platform</title>
      </Head>

      {/* Modern Aura Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[45%] bg-orange-400/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
               <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-slate-900">18th<span className="text-primary not-italic">Registry</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400 italic">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">Operational logic</a>
            <a href="#governance" className="hover:text-primary transition-colors">Governance</a>
          </div>

          <Link href="/login">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase italic px-8 h-12 shadow-xl shadow-slate-900/10 transition-all rounded-xl">
              Launch Console
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-10 pt-44 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="space-y-8"
           >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">The Architectural Operating System</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900">
                CORE <br />
                <span className="text-primary italic">PROTOCOLS.</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                The definitive internal registry for modular codebases. Discover, generate, and govern high-performance Magento 2 modules with grounded AI context.
              </p>
              
              <div className="flex items-center gap-6 pt-4">
                 <Link href="/login">
                    <Button size="lg" className="h-16 px-10 bg-primary text-white font-black uppercase italic tracking-wider rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98]">
                      Initiate Protocol
                    </Button>
                 </Link>
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] text-white font-bold shadow-sm">+12</div>
                 </div>
              </div>
           </motion.div>

           <div className="relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100"
              >
                 <div className="bg-slate-50 rounded-[2rem] p-10 space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-orange-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                       </div>
                       <div className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black text-slate-400 border border-slate-100 uppercase tracking-widest shadow-sm italic">
                          Session: Active
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="h-4 w-3/4 bg-slate-200/50 rounded-full" />
                       <div className="h-4 w-full bg-slate-200/50 rounded-full" />
                       <div className="h-24 w-full bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-primary/40 animate-pulse" />
                       </div>
                    </div>
                 </div>
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-12 top-10 z-20 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 flex items-center gap-4"
              >
                 <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Library className="w-6 h-6 text-orange-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 italic">Indexed Modules</p>
                    <p className="text-xl font-bold text-slate-900">1,248+</p>
                 </div>
              </motion.div>
           </div>
        </div>

        {/* Features Preview */}
        <div id="features" className="mt-56 grid grid-cols-1 md:grid-cols-3 gap-10">
           <FeatureCard icon={<Database className="w-8 h-8" />} title="BOILERPLATE ENGINE" desc="Standardized skeletons for every architectural pattern." />
           <FeatureCard icon={<Sparkles className="w-8 h-8" />} title="GROUNDED AI GEN" desc="Tailored generation with organization-specific context." />
           <FeatureCard icon={<ShieldCheck className="w-8 h-8" />} title="VERIFIED REGISTRY" desc="Strict compliance and governance by internal maintainers." />
        </div>
      </main>

      {/* Guide Section */}
      <section id="how-it-works" className="bg-slate-100 py-40 border-y border-slate-200">
         <div className="max-w-7xl mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-12">
                  <div className="space-y-4">
                     <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] italic">Operational logic</h2>
                     <h3 className="text-6xl font-black text-slate-900 tracking-tighter italic leading-tight">FOUR STEPS TO <br/>AUTONOMY.</h3>
                  </div>
                  
                  <div className="space-y-10">
                     <Step number="01" title="CONNECT" desc="Link your internal Git repositories or upload legacy modules." />
                     <Step number="02" title="DISCOVER" desc="Browse the verified library for existing architectural blocks." />
                     <Step number="03" title="GENERATE" desc="Use AI to adapt or build new logic from organizational seeds." />
                     <Step number="04" title="DEPLOY" desc="Consistent, validated code ready for production ecosystems." />
                  </div>
               </div>

               <div className="relative">
                  <div className="aspect-square bg-gradient-to-tr from-primary/10 to-indigo-600/10 rounded-[4rem] border border-white shadow-2xl flex items-center justify-center overflow-hidden">
                     <Terminal className="w-64 h-64 text-primary/5 animate-pulse" />
                     <div className="absolute inset-12 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white p-12 flex flex-col justify-center items-center text-center space-y-8 shadow-inner">
                        <div className="p-6 bg-primary rounded-3xl text-white shadow-2xl shadow-primary/40">
                           <Zap className="w-12 h-12 fill-current" />
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-tight">INITIATE NEXT-GEN <br/>COMMERCE PROTOCOLS.</h4>
                        <Link href="/login">
                           <Button className="bg-slate-900 text-white font-black uppercase italic h-16 px-12 rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20">
                              Access Console
                           </Button>
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-24 border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-4 group">
               <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <Zap className="w-6 h-6 text-primary fill-current" />
               </div>
               <div>
                  <p className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">18th Digitech</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Core Module Registry Platform</p>
               </div>
            </div>
            
            <p className="text-slate-400 font-medium text-sm italic">© 2024 Engineering Registry. All architectural rights reserved.</p>
            
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
               <a href="#" className="hover:text-primary transition-colors italic">Privacy</a>
               <a href="#" className="hover:text-primary transition-colors italic">Governance</a>
               <a href="#" className="hover:text-primary transition-colors italic">Support</a>
            </div>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all group"
  >
    <div className="p-5 bg-slate-50 rounded-3xl w-fit mb-10 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 italic tracking-tight mb-4 uppercase group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed italic">{desc}</p>
  </motion.div>
);

const Step = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className="flex gap-10 group">
    <div className="flex-shrink-0 text-5xl font-black text-slate-100 group-hover:text-primary/20 italic transition-colors duration-500">
      {number}
    </div>
    <div className="space-y-2">
      <h4 className="text-2xl font-black text-slate-900 uppercase italic group-hover:text-primary transition-colors tracking-tighter">{title}</h4>
      <p className="text-slate-500 italic font-medium leading-relaxed max-w-md">{desc}</p>
    </div>
  </div>
);

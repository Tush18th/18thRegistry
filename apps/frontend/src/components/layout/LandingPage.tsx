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
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export const LandingPage: React.FC = () => {
   return (
      <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 font-body">
         <Head>
            <title>18th Registry | Engineered Intelligence for Magento 2</title>
         </Head>

         {/* Grid Background */}
         <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

         {/* Navigation */}
         <nav className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
               <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
                     <Zap className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter uppercase font-heading text-slate-950">18th<span className="text-primary">Registry</span></span>
               </div>

               <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <a href="#features" className="hover:text-primary transition-colors">Ecosystem</a>
                  <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
                  <a href="#use-cases" className="hover:text-primary transition-colors">Use Cases</a>
               </div>

               <Link href="/login">
                  <Button variant="primary" size="md">
                     Launch Console
                  </Button>
               </Link>
            </div>
         </nav>

         {/* Hero Section */}
         <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-44 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8"
               >
                  <Badge variant="info" className="animate-pulse">The Engineering Standard</Badge>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-950 font-heading">
                     MODULAR <br />
                     <span className="text-primary italic">AUTONOMY.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                     The definitive internal registry for Magento 2 module excellence. Standardize patterns, generate validated logic, and govern your architectural lifecycle with grounded AI intelligence.
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
                     <Link href="/login">
                        <Button variant="glow" size="lg">
                           Initiate Protocol
                        </Button>
                     </Link>
                     <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                           {[1, 2, 3, 4].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                                 <img src={`https://i.pravatar.cc/100?u=${i * 10}`} alt="User" />
                              </div>
                           ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+18 Core Architects</span>
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

            {/* Core Definition Section - MISSION CONTROL */}
            <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
               <div className="md:col-span-2 space-y-8">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase italic font-heading">
                     Registry <span className="text-primary not-italic">Foundation.</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 ring-1 ring-slate-100 p-10 rounded-[2.5rem] bg-slate-50/30">
                     <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest italic">Identity</p>
                        <h4 className="text-xl font-bold text-slate-950 uppercase font-heading">What it is</h4>
                        <p className="text-sm text-slate-500 font-medium italic">A centralized governance platform for Magento 2 module lifecycle management and AI-assisted generation.</p>
                     </div>
                     <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest italic">Audience</p>
                        <h4 className="text-xl font-bold text-slate-950 uppercase font-heading">Who it is for</h4>
                        <p className="text-sm text-slate-500 font-medium italic">Designed for 18th Digitech architects, senior developers, and system integrators seeking architectural parity.</p>
                     </div>
                  </div>
               </div>
               <Card className="p-10 bg-slate-950 text-white space-y-6">
                  <h4 className="text-lg font-black uppercase tracking-widest italic font-heading">Why it exists</h4>
                  <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                     Fragmented codebases create technical debt. 18th Registry enforces a "Single Source of Truth" for every commerce module deployed.
                  </p>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-primary uppercase">Governance L1</span>
                     <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
               </Card>
            </section>

            {/* Functional Ecosystem */}
            <div id="features" className="mt-56 space-y-24">
               <div className="max-w-3xl space-y-4">
                  <h2 className="text-primary font-black uppercase tracking-[0.4em] text-xs">Functional Ecosystem</h2>
                  <h3 className="text-5xl font-black text-slate-950 tracking-tighter font-heading uppercase italic">Engineered for <br /> Architectural Integrity.</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureCard
                     icon={<Database className="w-8 h-8" />}
                     title="Pattern Library"
                     desc="A centralized, versioned repository of certified Magento 2 modules. Every entry is vetted for standards compliance and architectural purity."
                  />
                  <FeatureCard
                     icon={<Sparkles className="w-8 h-8" />}
                     title="Grounded Intelligence"
                     desc="AI generation that understands your local coding standards. No generic code—only modules that fit perfectly into your specific mono-repo context."
                  />
                  <FeatureCard
                     icon={<ShieldCheck className="w-8 h-8" />}
                     title="Audit Ledger"
                     desc="Traceable provenance for every line of code. Automated validation reports and governance checks at every stage of the lifecycle."
                  />
               </div>
            </div>
         </main>

         {/* Workflow Section */}
         <section id="workflow" className="py-40 bg-slate-50 border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div className="space-y-12">
                     <div className="space-y-4">
                        <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Operational Pipeline</h2>
                        <h3 className="text-6xl font-black text-slate-950 tracking-tighter font-heading italic leading-tight">THE PATH TO <br />PRODUCTION.</h3>
                     </div>

                     <div className="space-y-12">
                        <Step number="01" title="Ingest & Index" desc="Connect existing Git repositories or upload legacy module ZIPs. Our engine indexes logic, namespaces, and dependencies instantly." />
                        <Step number="02" title="Analyze Context" desc="The grounded AI scans your organizational tech stack, identifying reusable patterns and identifying compatibility risks." />
                        <Step number="03" title="Generate Logic" desc="Adopt reference patterns or generate new functional modules using AI seeded with your internal architectural requirements." />
                        <Step number="04" title="Verify & Govern" desc="Pass through automated compliance checks. Verified modules are tagged, versioned, and promoted to the official internal registry." />
                     </div>
                  </div>

                  <div className="relative">
                     <Card glass className="aspect-square flex items-center justify-center p-12 overflow-hidden">
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                           <Terminal className="w-full h-full text-primary" />
                        </div>
                        <div className="relative z-10 text-center space-y-8">
                           <div className="w-20 h-20 bg-primary rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-primary/40">
                              <Zap className="w-10 h-10 text-white fill-current" />
                           </div>
                           <h4 className="text-3xl font-black text-slate-950 font-heading leading-tight uppercase italic">Initiate Next-Gen <br />Commerce protocols.</h4>
                           <Link href="/login">
                              <Button variant="glow" size="lg">
                                 Access Console
                              </Button>
                           </Link>
                        </div>
                     </Card>
                  </div>
               </div>
            </div>
         </section>

         {/* Use Cases Section */}
         <section id="use-cases" className="py-40 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-24">
               <div className="text-center space-y-4">
                  <h2 className="text-primary font-black uppercase tracking-[0.4em] text-xs">Strategic Scenarios</h2>
                  <h3 className="text-5xl font-black text-slate-950 tracking-tighter font-heading uppercase italic">Built for the Enterprise.</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-12 hover:border-primary/20 transition-all flex flex-col gap-6">
                     <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-indigo-500" />
                     </div>
                     <h4 className="text-2xl font-bold tracking-tight text-slate-950 uppercase italic font-heading">Legacy Refactoring</h4>
                     <p className="text-slate-500 leading-relaxed font-medium">Quickly migrate and standardize fragmented legacy codebases into modern, modular architectures with automated namespace refactoring and dependency mapping.</p>
                  </Card>
                  <Card className="p-12 hover:border-primary/20 transition-all flex flex-col gap-6">
                     <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                        <Grid className="w-6 h-6 text-orange-500" />
                     </div>
                     <h4 className="text-2xl font-bold tracking-tight text-slate-950 uppercase italic font-heading">Rapid Prototyping</h4>
                     <p className="text-slate-500 leading-relaxed font-medium">Bootstrapping new Magento projects with a pre-validated library of commerce patterns. Save weeks of development by generating standardized skeletons in seconds.</p>
                  </Card>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className="bg-slate-950 text-white py-24 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
               <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex items-center gap-4 group">
                     <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary fill-current" />
                     </div>
                     <div>
                        <p className="text-xl font-black uppercase font-heading tracking-tighter">18th Digitech</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic leading-none">Architectural Intelligence Platform</p>
                     </div>
                  </div>

                  <p className="text-slate-500 font-medium text-sm italic">© 2026 Engineering Registry. All architectural rights reserved.</p>

                  <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                     <a href="#" className="hover:text-primary transition-colors italic">Privacy</a>
                     <a href="#" className="hover:text-primary transition-colors italic">Governance</a>
                     <a href="#" className="hover:text-primary transition-colors italic">Internal Support</a>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};

const FeatureCard = ({ icon, title, desc }: { icon: any; title: string; desc: string }) => (
   <motion.div
      whileHover={{ y: -10 }}
      className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-premium hover:shadow-premium-hover hover:border-primary/20 transition-all group"
   >
      <div className="p-5 bg-slate-50 rounded-3xl w-fit mb-8 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
         {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-950 tracking-tight mb-4 uppercase italic group-hover:text-primary transition-colors font-heading">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed italic">{desc}</p>
   </motion.div>
);

const Step = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
   <div className="flex gap-10 group">
      <div className="flex-shrink-0 text-5xl font-black text-slate-200 group-hover:text-primary/20 italic transition-colors duration-500 font-heading">
         {number}
      </div>
      <div className="space-y-2">
         <h4 className="text-2xl font-black text-slate-950 uppercase italic group-hover:text-primary transition-colors tracking-tighter font-heading">{title}</h4>
         <p className="text-slate-500 italic font-medium leading-relaxed max-w-md">{desc}</p>
      </div>
   </div>
);

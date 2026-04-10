import React, { useState } from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import { 
  Library, 
  Search, 
  Filter, 
  ArrowLeft, 
  Package, 
  ChevronRight, 
  ShieldCheck, 
  Database,
  ExternalLink,
  Plus,
  FileArchive
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ZipUploadModal } from '@/components/library/ZipUploadModal';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);

  const { data: modules, isLoading, refetch } = useQuery(['library-search', search, vendorFilter], async () => {
    const res = await api.get('/modules/search', { params: { query: search, vendor: vendorFilter } });
    return res.data;
  });

  const { data: stats } = useQuery('registry-stats', async () => {
     const res = await api.get('/modules/stats');
     return res.data;
  });

  return (
    <>
      <Head>
        <title>Module Library | 18th Module Registry</title>
      </Head>

      <div className="space-y-12 pb-20">
         <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
               <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-slate-400 hover:text-primary">
                     <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                  </Button>
               </Link>
               <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter italic flex items-center gap-4 font-heading">
                  <Library className="text-primary w-10 h-10" /> OFFICIAL LIBRARY
               </h1>
               <p className="text-slate-500 font-medium italic">Verified reference patterns and architectural building blocks for Magento 2.</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-10 md:pt-0">
               <Button 
                  variant="secondary"
                  onClick={() => setIsZipModalOpen(true)}
                  className="h-14 px-8"
               >
                  <FileArchive className="mr-3 w-5 h-5 text-primary" /> Upload ZIP
               </Button>
               <Link href="/registry/ingest">
                  <Button variant="primary" size="lg" className="h-14">
                     <Plus className="mr-3 w-5 h-5" /> Ingest Repository
                  </Button>
               </Link>
            </div>
         </div>

         <ZipUploadModal 
            isOpen={isZipModalOpen} 
            onClose={() => setIsZipModalOpen(false)} 
            onSuccess={() => refetch()}
         />

         {/* Filters & Search */}
         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 relative group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
               <Input 
                  placeholder="Search by module name, namespace, or functional logic..." 
                  className="pl-14 h-16 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="md:col-span-4 relative group">
               <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
               <select 
                  className="w-full h-16 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none text-slate-600 font-bold italic shadow-sm"
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
               >
                  <option value="">All Vendors</option>
                  {stats?.vendors?.map((v: string) => (
                     <option key={v} value={v}>{v}</option>
                  ))}
               </select>
            </div>
         </div>

         {/* Results Grid */}
         {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-72 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm" />
               ))}
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {modules?.map((mod: any) => (
                  <Link key={mod.id} href={`/library/${mod.id}`}>
                     <Card className="group hover:border-primary/30 hover:shadow-premium-hover p-0 flex flex-col h-full">
                        <div className="p-10 flex-1 space-y-8">
                           <div className="flex justify-between items-start">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                 <Package className="w-8 h-8 text-slate-400 group-hover:text-white" />
                              </div>
                              <Badge variant="default">{mod.vendor}</Badge>
                           </div>
                           
                           <div className="space-y-2">
                              <h3 className="text-2xl font-black text-slate-950 group-hover:text-primary transition-colors uppercase tracking-tight font-heading">{mod.name}</h3>
                              <p className="text-xs text-slate-400 font-mono italic">{mod.namespace}</p>
                           </div>

                           <p className="text-sm text-slate-500 font-medium italic line-clamp-3 leading-relaxed">
                              {mod.description || 'Verified reference architectural module available for secure internal implementation.'}
                           </p>
                        </div>

                        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between rounded-b-[2.5rem] group-hover:bg-primary/5 transition-all">
                           <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-green-500" />
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Core Verified</span>
                           </div>
                           <div className="flex items-center gap-1 text-primary font-black text-[10px] uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              Specs <ChevronRight className="w-3 h-3" />
                           </div>
                        </div>
                     </Card>
                  </Link>
               ))}
            </div>
         )}

         {!isLoading && modules?.length === 0 && (
            <div className="text-center py-32 bg-white border border-slate-100 border-dashed rounded-[3.5rem] space-y-6 shadow-sm">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search className="w-12 h-12 text-slate-200" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter font-heading">No modules matched</h3>
                  <p className="text-slate-500 font-medium italic max-w-md mx-auto">Adjust your search criteria or check the vendor filters to find the architectural blocks you need.</p>
               </div>
            </div>
         )}
      </div>
    </>
  );
}

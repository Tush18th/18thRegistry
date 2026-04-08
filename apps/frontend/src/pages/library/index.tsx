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

      <div className="space-y-8 pb-20">
         <div className="flex justify-between items-start">
            <div className="space-y-2">
               <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-2 mb-2 p-0 hover:bg-transparent text-slate-400 hover:text-primary">
                     <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                  </Button>
               </Link>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
                  <Library className="text-primary w-10 h-10" /> OFFICIAL LIBRARY
               </h1>
               <p className="text-slate-500 font-medium italic">Verified reference patterns and architectural building blocks.</p>
            </div>
            <div className="flex gap-4">
               <Button 
                  onClick={() => setIsZipModalOpen(true)}
                  className="h-12 px-6 bg-white border border-slate-200 text-slate-600 font-bold uppercase italic hover:bg-slate-50 shadow-sm"
               >
                  <FileArchive className="mr-2 w-5 h-5 text-primary" /> Upload Module ZIP
               </Button>
               <Link href="/registry/ingest">
                  <Button className="h-12 px-6 bg-slate-900 text-white font-black uppercase italic shadow-xl shadow-slate-900/10">
                     <Plus className="mr-2 w-5 h-5" /> Ingest Repository
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
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
               <Input 
                  placeholder="Search by module name, namespace, or functional logic..." 
                  className="pl-12 h-14 bg-white border-slate-200 focus:ring-primary/20 focus:border-primary shadow-sm rounded-2xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="md:col-span-4 relative">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
               <select 
                  className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:ring-primary/20 focus:border-primary transition-all appearance-none text-slate-600 font-bold italic"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-64 bg-slate-50 rounded-3xl animate-pulse border border-slate-100" />
               ))}
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {modules?.map((mod: any) => (
                  <Link key={mod.id} href={`/library/${mod.id}`}>
                     <Card className="h-full bg-white border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden rounded-3xl">
                        <CardContent className="p-0 flex flex-col h-full">
                           <div className="p-8 space-y-6 flex-1">
                              <div className="flex justify-between items-start">
                                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                    <Package className="w-7 h-7 text-slate-400 group-hover:text-white" />
                                 </div>
                                 <Badge variant="default" className="bg-slate-50 text-slate-400 border-slate-100 font-black uppercase text-[10px] tracking-widest italic">{mod.vendor}</Badge>
                              </div>
                              
                              <div className="space-y-1">
                                 <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">{mod.name}</h3>
                                 <p className="text-xs text-slate-400 font-mono italic">{mod.namespace}</p>
                              </div>

                              <p className="text-sm text-slate-500 font-medium italic line-clamp-3 leading-relaxed">
                                 {mod.description || 'No detailed documentation available for this architectural module.'}
                              </p>
                           </div>

                           <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                              <div className="flex items-center gap-2">
                                 <ShieldCheck className="w-4 h-4 text-green-500" />
                                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Core Verified</span>
                              </div>
                              <div className="flex items-center gap-1 text-primary font-black text-[10px] uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-opacity">
                                 View Specs <ChevronRight className="w-3 h-3" />
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </Link>
               ))}
            </div>
         )}

         {!isLoading && modules?.length === 0 && (
            <div className="text-center py-24 bg-white border border-slate-100 border-dashed rounded-[2.5rem] space-y-4 shadow-sm">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-200" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">No modules matching criteria</h3>
                  <p className="text-slate-400 font-medium italic">Adjust your search parameters or check the vendor filters.</p>
               </div>
            </div>
         )}
      </div>
    </>
  );
}

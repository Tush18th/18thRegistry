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
  Plus
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  const { data: modules, isLoading } = useQuery(['library-search', search, vendorFilter], async () => {
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
                  <Button variant="ghost" size="sm" className="gap-2 mb-2 p-0 hover:bg-transparent text-gray-500">
                     <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                  </Button>
               </Link>
               <h1 className="text-4xl font-black text-white tracking-tighter italic flex items-center gap-3">
                  <Library className="text-primary w-10 h-10" /> OFFICIAL LIBRARY
               </h1>
               <p className="text-gray-400 font-medium italic">Verified reference patterns and architectural building blocks.</p>
            </div>
            <Link href="/registry/ingest">
               <Button className="h-12 px-6 bg-primary text-black font-black uppercase italic shadow-xl shadow-primary/20">
                  <Plus className="mr-2 w-5 h-5" /> Ingest Repository
               </Button>
            </Link>
         </div>

         {/* Filters & Search */}
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <Input 
                   placeholder="Search modules by name, namespace or description..." 
                   className="pl-12 h-14 bg-gray-900 border-gray-800 text-lg rounded-2xl"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="md:col-span-4 relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                <select 
                  className="w-full h-14 pl-12 pr-4 bg-gray-900 border border-gray-800 rounded-2xl text-white appearance-none focus:ring-2 focus:ring-primary outline-none transition-all font-bold italic uppercase text-sm"
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
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules?.map((mod: any) => (
               <Card key={mod.id} className="bg-gray-900/40 border-gray-800 hover:border-primary/40 group transition-all">
                  <CardContent className="p-8 space-y-6">
                     <div className="flex justify-between items-start">
                        <div className="p-4 bg-gray-800 rounded-2xl group-hover:bg-primary group-hover:text-black transition-all">
                           <Package className="w-8 h-8" />
                        </div>
                        <Badge variant="default" className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-gray-800">{mod.vendor}</Badge>
                     </div>

                     <div className="space-y-1">
                        <h3 className="text-xl font-black text-white uppercase italic group-hover:text-primary transition-colors">{mod.name}</h3>
                        <p className="text-xs font-mono text-gray-600 truncate">{mod.namespace}</p>
                     </div>

                     <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 h-15 font-medium">
                        {mod.description || 'Verified Magento 2 module pattern available for organizational reuse and AI-grounded generation.'}
                     </p>

                     <div className="flex flex-wrap gap-2 pt-2">
                        {mod.capabilities?.slice(0, 3).map((cap: string) => (
                           <Badge key={cap} variant="default" className="bg-gray-800 text-gray-400 text-[9px] uppercase tracking-wider font-bold p-0 px-2 border-none">
                              {cap.replace('_', ' ')}
                           </Badge>
                        ))}
                     </div>

                     <div className="flex items-center justify-between pt-6 border-t border-gray-800 group-hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-2">
                           {mod.status === 'approved' ? (
                              <div className="flex items-center gap-2 text-green-500">
                                 <ShieldCheck className="w-5 h-5" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                              </div>
                           ) : (
                              <div className="flex items-center gap-2 text-yellow-500/50">
                                 <Database className="w-5 h-5" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Pending Review</span>
                              </div>
                           )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-700 group-hover:text-primary p-0 h-auto font-black uppercase italic tracking-tighter gap-1">
                           Inspect <ChevronRight className="w-4 h-4" />
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         {!isLoading && modules?.length === 0 && (
            <div className="text-center py-20 bg-gray-900/20 border border-gray-800 border-dashed rounded-3xl space-y-4">
               <Search className="w-12 h-12 text-gray-800 mx-auto" />
               <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-500 uppercase italic">No modules found</h3>
                  <p className="text-sm text-gray-700">Try adjusting your filters or search query.</p>
               </div>
            </div>
         )}
      </div>
    </>
  );
}

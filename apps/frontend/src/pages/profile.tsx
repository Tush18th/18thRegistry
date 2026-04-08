import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Clock, 
  MapPin, 
  Briefcase,
  Camera,
  Edit2
} from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 font-bold italic">
        Loading user identity...
      </div>
    );
  }

  const profileItems = [
    { label: 'Email Address', value: user.email, icon: Mail },
    { label: 'Platform Role', value: user.role.replace(/_/g, ' '), icon: Shield, highlight: true },
    { label: 'Department', value: user.department || 'Engineering', icon: Briefcase },
    { label: 'Job Title', value: user.jobTitle || 'Module Developer', icon: User },
    { label: 'Location', value: 'Headquarters', icon: MapPin },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="relative mb-16">
        {/* Cover Pattern */}
        <div className="h-56 rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-primary/40 border border-white/10 overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        {/* Profile Card */}
        <div className="absolute -bottom-16 left-12 flex items-end">
          <div className="relative group">
            <div className="w-36 h-36 rounded-[2rem] bg-white p-1.5 shadow-2xl">
               <div className="w-full h-full rounded-[1.75rem] bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl font-black text-white">{user.fullName.charAt(0)}</span>
               </div>
            </div>
            <button className="absolute -bottom-2 -right-2 p-2.5 bg-slate-900 rounded-xl text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all border border-white/20">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-8 mb-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{user.fullName}</h1>
            <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mt-1 italic">
              {user.role.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-28 grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileItems.map((item, idx) => (
          <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center group hover:border-primary/50 transition-all shadow-sm hover:shadow-xl shadow-slate-200/50">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-6 transition-colors ${
              item.highlight ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 group-hover:text-primary'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 italic">{item.label}</p>
              <p className={`text-lg font-bold text-slate-900 tracking-tight capitalize`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}

        <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl shadow-slate-200/50 md:col-span-2">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mr-6">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 italic">Account Status</p>
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 shadow-lg shadow-green-500/50 animate-pulse"></div>
                  <p className="text-lg font-bold text-slate-900 tracking-tight">Active Protocol</p>
                </div>
              </div>
            </div>
            {user?.role === UserRole.SUPER_ADMIN && (
              <button className="flex items-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-slate-900/10">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

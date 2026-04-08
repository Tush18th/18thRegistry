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
import { useAuth } from '@/contexts/AuthContext';

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
      <div className="relative mb-12">
        {/* Cover Pattern */}
        <div className="h-48 rounded-3xl bg-gradient-to-br from-indigo-900 to-primary/30 border border-white/5 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        {/* Profile Card */}
        <div className="absolute -bottom-16 left-12 flex items-end">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary to-indigo-600 border-4 border-surface shadow-2xl flex items-center justify-center overflow-hidden">
               <span className="text-4xl font-black text-white">{user.fullName.charAt(0)}</span>
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/30 opacity-0 group-hover:opacity-100 transition-all border border-white/20">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-6 mb-2">
            <h1 className="text-3xl font-black text-white tracking-tight">{user.fullName}</h1>
            <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">
              {user.role.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileItems.map((item, idx) => (
          <div key={idx} className="p-6 bg-surface border border-border rounded-2xl flex items-center group hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/5 shadow-black/20">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-6 transition-colors ${
              item.highlight ? 'bg-primary text-black' : 'bg-white/5 text-gray-500 group-hover:text-primary'
            }`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-1">{item.label}</p>
              <p className={`text-lg font-bold text-white tracking-tight capitalize`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}

        <div className="p-6 bg-surface border border-border rounded-2xl flex items-center justify-between group hover:border-indigo-500 transition-all shadow-lg shadow-black/20 md:col-span-2">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mr-6 text-indigo-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-1">Account Status</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-lg shadow-green-500/50 pulse"></div>
                  <p className="text-lg font-bold text-white tracking-tight">Active</p>
                </div>
              </div>
            </div>
            <button className="flex items-center px-4 py-2 bg-surface hover:bg-white/5 border border-border hover:border-primary/50 text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest">
              <Edit2 className="w-4 h-4 mr-2 text-primary" />
              Edit Profile
            </button>
        </div>
      </div>
    </div>
  );
}

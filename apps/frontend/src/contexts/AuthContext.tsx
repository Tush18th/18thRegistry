import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MAINTAINER = 'maintainer',
  REVIEWER = 'reviewer',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
  profilePhotoUrl?: string;
  department?: string;
  jobTitle?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  hasRole: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      setUser(res.data);
    } catch (error) {
      console.warn('Failed to fetch profile', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    await fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN) return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

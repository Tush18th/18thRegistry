import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface RequireRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles, children }) => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !hasRole(roles)) {
      router.push('/unauthorized');
    }
  }, [user, loading, hasRole, roles, router]);

  if (loading || !user || !hasRole(roles)) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

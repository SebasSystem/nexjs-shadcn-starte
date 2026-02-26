'use client';

import { ReactNode } from 'react';
import { useAuthContext } from '../hooks/use-auth-context';

type Props = {
  hasContent?: boolean;
  roles?: string[];
  children: ReactNode;
};

export function RoleBasedGuard({ hasContent, roles, children }: Props) {
  const { user } = useAuthContext();
  const currentRole = user?.role || user?.roles?.[0]?.name;

  if (typeof currentRole !== 'undefined' && currentRole && roles && !roles.includes(currentRole)) {
    return hasContent ? (
      <div className="flex flex-col justify-center items-center p-8 bg-background">
        <h3 className="text-xl font-bold mb-2">Permission Denied</h3>
        <p className="text-muted-foreground">You do not have permission to access this resource.</p>
      </div>
    ) : null;
  }
  return <>{children}</>;
}

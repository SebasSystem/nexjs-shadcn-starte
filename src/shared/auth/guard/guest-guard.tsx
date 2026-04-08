'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useAuthContext } from '../hooks/use-auth-context';
import { Spinner } from '../../components/feedback/Spinner';
import type { UserModule } from '../types';

type Props = { children: ReactNode };

function getFirstModulePath(modules: UserModule[]): string | null {
  const sorted = [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const mod of sorted) {
    const items = [...mod.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const item of items) {
      if (item.path) return item.path;
      if (item.children?.length) {
        const child = [...item.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
        if (child.path) return child.path;
      }
    }
  }
  return null;
}

function canAccessPath(path: string, modules: UserModule[]): boolean {
  for (const mod of modules) {
    for (const item of mod.items) {
      if (item.path === path) return true;
      if (item.children?.some((c) => c.path === path)) return true;
    }
  }
  return false;
}

export function GuestGuard({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, loading, user } = useAuthContext();

  useEffect(() => {
    if (!loading && authenticated) {
      const returnTo = searchParams.get('returnTo');
      const modules = (user?.modules ?? []) as UserModule[];
      const firstPath = modules.length ? getFirstModulePath(modules) : null;
      const validReturnTo = returnTo && canAccessPath(returnTo, modules) ? returnTo : null;
      router.replace(validReturnTo || firstPath || paths.dashboard.root);
    }
  }, [authenticated, loading, router, searchParams, user]);

  if (loading || authenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { Spinner } from '../../components/feedback/Spinner';
import { useAuthContext } from '../hooks/use-auth-context';
import { getFirstAccessibleRoute } from '../route-access';

type Props = { children: ReactNode };

export function GuestGuard({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, loading, modules, user } = useAuthContext();

  useEffect(() => {
    if (!loading && authenticated) {
      const returnTo = searchParams.get('returnTo');
      const target = returnTo || getFirstAccessibleRoute(modules, user?.role);
      router.replace(target);
    }
  }, [authenticated, loading, modules, user?.role, router, searchParams]);

  if (loading || authenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

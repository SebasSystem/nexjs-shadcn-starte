'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { Spinner } from '../../components/feedback/Spinner';
import { useAuthContext } from '../hooks/use-auth-context';

type Props = { children: ReactNode };

export function GuestGuard({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && authenticated) {
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        router.replace(returnTo);
      }
      // If no returnTo, let RouteGuard determine the first accessible module
    }
  }, [authenticated, loading, router, searchParams]);

  if (loading || authenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

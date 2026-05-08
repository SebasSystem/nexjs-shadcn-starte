'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Spinner } from '../../components/feedback/Spinner';
import { useAuthContext } from '../hooks/use-auth-context';

type Props = { children: ReactNode };

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { authenticated, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    if (!authenticated) {
      const returnTo = window.location.pathname;
      const search = window.location.search;
      let href = paths.auth.jwt.signIn;
      if (returnTo && returnTo !== '/') {
        href = `${href}?returnTo=${encodeURIComponent(`${returnTo}${search}`)}`;
      }
      router.replace(href);
    }
  }, [authenticated, loading, router]);

  if (loading || !authenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

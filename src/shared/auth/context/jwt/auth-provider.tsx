'use client';

import { ReactNode, useEffect, useState, useMemo, useCallback } from 'react';
import { AuthContext } from '../auth-context';
import { isValidToken, setSession } from './utils';
import { AuthState } from 'src/shared/auth/types';

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken =
        sessionStorage.getItem('accessToken') || sessionStorage.getItem('jwt_access_token');

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        // Simulación temporal porque no hay backend real, según MOCK_USER
        const { MOCK_USER } = await import('src/_mock');

        setState({ user: MOCK_USER as AuthState['user'], loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      authenticated: state.user !== null,
      unauthenticated: state.user === null,
      checkUserSession,
    }),
    [state.user, state.loading, checkUserSession]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

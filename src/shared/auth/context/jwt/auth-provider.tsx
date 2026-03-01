'use client';

import { ReactNode, useEffect, useState, useMemo, useCallback } from 'react';
import { AuthContext } from '../auth-context';
import { isValidToken, setSession } from './utils';
import { AuthState } from 'src/shared/auth/types';
import { getInitData } from 'src/features/auth/services/auth.service';

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken =
        sessionStorage.getItem('accessToken') || sessionStorage.getItem('jwt_access_token');

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        // Llamar al endpoint /auth/init-data
        const response = await getInitData();
        const profileData = response?.data || response;

        if (profileData && Object.keys(profileData).length > 0) {
          const dataRecord = profileData as Record<string, unknown>;
          setState({
            user: {
              ...dataRecord,
              accessToken,
              displayName: (dataRecord.names || dataRecord.name || dataRecord.firstName) as string,
              roles: (dataRecord.roles as object[]) || [],
              modules: (dataRecord.modules as object[]) || [],
            } as unknown as AuthState['user'],
            loading: false,
          });
        } else {
          // Si el endpoint responde pero no hay datos válidos (raro si es 200)
          setState({ user: null, loading: false });
        }
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkUserSession();
    };
    init();
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

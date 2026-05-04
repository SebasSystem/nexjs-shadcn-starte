'use client';

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getInitData } from 'src/features/auth/services/auth.service';
import { localizationService } from 'src/features/settings/services/localization.service';
import { AuthState } from 'src/shared/auth/types';

import { AuthContext } from '../auth-context';
import { isValidToken, setSession } from './utils';

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, permissions: [] });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken =
        sessionStorage.getItem('accessToken') || sessionStorage.getItem('jwt_access_token');

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const { user, permissions } = await getInitData();

        if (user?.uid) {
          await localizationService.get().catch(() => {});

          setState({
            user: {
              uid: user.uid,
              name: user.name ?? user.names ?? '',
              email: user.email ?? '',
              tenant_uid: user.tenant_uid,
              two_factor_enabled: user.two_factor_enabled,
              permissions,
            },
            permissions,
            loading: false,
          });
          return permissions;
        } else {
          setState({ user: null, loading: false, permissions: [] });
        }
      } else {
        setState({ user: null, loading: false, permissions: [] });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Auth] Session check failed:', (error as Error)?.message ?? 'Unknown error');
      }
      setState({ user: null, loading: false, permissions: [] });
    }
    return [];
  }, []);

  useEffect(() => {
    async function init() {
      await checkUserSession();
    }
    init();
  }, [checkUserSession]);

  const hasPermission = useCallback(
    (key: string) => state.permissions.includes(key),
    [state.permissions]
  );

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      permissions: state.permissions,
      hasPermission,
      authenticated: state.user !== null,
      unauthenticated: state.user === null,
      checkUserSession,
    }),
    [state.user, state.loading, state.permissions, hasPermission, checkUserSession]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

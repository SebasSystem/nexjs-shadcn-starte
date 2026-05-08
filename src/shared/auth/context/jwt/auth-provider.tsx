'use client';

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { init } from 'src/features/auth/services/auth.service';
import { localizationService } from 'src/features/settings/services/localization.service';
import type { AuthState, Module } from 'src/shared/auth/types';

import { AuthContext } from '../auth-context';
import { isValidToken, setSession } from './utils';

type Props = { children: ReactNode };

function derivePermissions(modules: Module[]): string[] {
  return modules.flatMap((m) => m.permissions.map((p) => `${m.key}.${p}`));
}

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    permissions: [],
    modules: [],
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken =
        sessionStorage.getItem('accessToken') || sessionStorage.getItem('jwt_access_token');

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const data = await init();
        const { user, modules, localization: loc } = data;

        if (user?.uid) {
          // Cache localization silently — best effort
          if (loc) {
            localizationService.get().catch(() => {});
          }

          const permissions = derivePermissions(modules);

          setState({
            user: {
              uid: user.uid,
              name: user.name ?? '',
              email: user.email ?? '',
              role: user.role,
              tenant_uid: user.tenant_uid,
              two_factor_enabled: user.two_factor_enabled,
              permissions,
            },
            permissions,
            modules,
            loading: false,
          });
          return { permissions, modules, role: user.role };
        } else {
          setState({ user: null, loading: false, permissions: [], modules: [] });
        }
      } else {
        setState({ user: null, loading: false, permissions: [], modules: [] });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Auth] Session check failed:', (error as Error)?.message ?? 'Unknown error');
      }
      setState({ user: null, loading: false, permissions: [], modules: [] });
    }
    return { permissions: [], modules: [], role: undefined };
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
      modules: state.modules,
      hasPermission,
      authenticated: state.user !== null,
      unauthenticated: state.user === null,
      checkUserSession,
    }),
    [state.user, state.loading, state.permissions, state.modules, hasPermission, checkUserSession]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

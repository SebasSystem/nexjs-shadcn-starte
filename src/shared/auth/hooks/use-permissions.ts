import { useAuthContext } from './use-auth-context';

export function usePermissions() {
  const { permissions, hasPermission } = useAuthContext();
  return {
    permissions,
    hasPermission,
    can: hasPermission,
  };
}

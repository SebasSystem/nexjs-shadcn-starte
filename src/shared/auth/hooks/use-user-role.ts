import { useAuthContext } from './use-auth-context';

export function useUserRole() {
  const { user, hasPermission, permissions } = useAuthContext();

  const isAdmin = hasPermission('admin.read') || hasPermission('admin.manage');
  const isSuperAdmin = hasPermission('superadmin.manage');

  return { user, isAdmin, isSuperAdmin, permissions, hasPermission };
}

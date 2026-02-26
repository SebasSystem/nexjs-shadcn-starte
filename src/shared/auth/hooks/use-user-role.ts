import { useAuthContext } from './use-auth-context';

type Role = { id: string; name: string };

export function useUserRole() {
  const { user } = useAuthContext();

  const currentRole = user?.role || user?.roles?.[0]?.name || 'Guest';

  const isAdmin =
    currentRole === 'Administrador' ||
    currentRole === 'Admin' ||
    currentRole === '2' ||
    currentRole === '1';
  const isSuperAdmin = currentRole === 'SuperAdmin' || currentRole === '1';

  const roles = user?.roles || [];

  const hasRoleById = (id: string) => roles.some((r: Role) => r.id === id);

  return { user, userRole: currentRole, isAdmin, isSuperAdmin, roles, hasRoleById };
}

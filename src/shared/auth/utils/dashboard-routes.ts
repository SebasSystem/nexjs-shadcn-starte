import { User } from 'src/types';
import { paths } from 'src/routes/paths';

export const getDashboardRoute = (user: User): string => {
  if (!user) return paths.auth.jwt.signIn;

  const currentRole = user.role || user.roles?.[0]?.name;

  if (currentRole === 'Administrador' || currentRole === 'SuperAdmin' || currentRole === 'Admin') {
    return paths.dashboard.root;
  }

  return paths.dashboard.root;
};

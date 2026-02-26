const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

export const paths = {
  page404: '/error/404',

  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/login`,
      signUp: `${ROOTS.AUTH}/register`,
    },
  },

  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    users: {
      root: `${ROOTS.DASHBOARD}/users`,
      create: `${ROOTS.DASHBOARD}/users/create`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/users/${id}/edit`,
    },
    roles: {
      root: `${ROOTS.DASHBOARD}/roles`,
    },
  },
};

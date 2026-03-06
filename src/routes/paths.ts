const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
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

  // INVENTORY
  inventory: {
    root: ROOTS.INVENTORY,
    products: `${ROOTS.INVENTORY}/products`,
    warehouses: {
      root: `${ROOTS.INVENTORY}/warehouses`,
      movements: `${ROOTS.INVENTORY}/warehouses/movements`,
    },
    stock: `${ROOTS.INVENTORY}/stock`,
    reports: `${ROOTS.INVENTORY}/reports`,
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

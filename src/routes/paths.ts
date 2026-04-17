const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  SALES: '/sales',
  ADMIN: '/admin',
  CONTACTS: '/contacts',
  SCHEDULE: '/schedule',
  REPORTS: '/reports',
  HR: '/hr',
  SETTINGS: '/settings',
  PROJECTS: '/projects',
  PARTNERS: '/partners',
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

  // SALES
  sales: {
    root: ROOTS.SALES,
    pipeline: `${ROOTS.SALES}/pipeline`,
    quotation: (id: string) => `${ROOTS.SALES}/quotation/${id}`,
    invoice: (id: string) => `${ROOTS.SALES}/invoice/${id}`,
    finance: {
      root: `${ROOTS.SALES}/finance`,
      quotation: `${ROOTS.SALES}/finance/quotation`,
      invoice: `${ROOTS.SALES}/finance/invoice`,
      creditRules: `${ROOTS.SALES}/finance/credit-rules`,
      multiCurrency: `${ROOTS.SALES}/finance/multi-currency`,
    },
  },

  // REPORTS
  reports: {
    root: ROOTS.REPORTS,
    inventory: `${ROOTS.REPORTS}/inventory`,
    sales: `${ROOTS.REPORTS}/sales`,
  },

  // ADMIN (SaaS)
  admin: {
    root: ROOTS.ADMIN,
    dashboard: `${ROOTS.ADMIN}/dashboard`,
    tenants: `${ROOTS.ADMIN}/tenants`,
    plans: `${ROOTS.ADMIN}/plans`,
    billing: `${ROOTS.ADMIN}/billing`,
    telemetry: `${ROOTS.ADMIN}/telemetry`,
  },

  // CONTACTS
  contacts: {
    root: ROOTS.CONTACTS,
    segments: `${ROOTS.CONTACTS}/segments`,
  },

  // SCHEDULE
  schedule: {
    root: ROOTS.SCHEDULE,
  },

  // HR / COMMISSIONS
  hr: {
    root: ROOTS.HR,
    commissions: {
      root: `${ROOTS.HR}/commissions`,
      plans: `${ROOTS.HR}/commissions/plans`,
      assignment: `${ROOTS.HR}/commissions/assignment`,
      dashboard: `${ROOTS.HR}/commissions/dashboard`,
      simulator: `${ROOTS.HR}/commissions/simulator`,
      history: `${ROOTS.HR}/commissions/history`,
    },
  },

  // PROJECTS
  projects: {
    root: ROOTS.PROJECTS,
    detail: (id: string) => `${ROOTS.PROJECTS}/${id}`,
  },

  // PARTNERS
  partners: {
    root: ROOTS.PARTNERS,
    opportunities: `${ROOTS.PARTNERS}/opportunities`,
    portal: `${ROOTS.PARTNERS}/portal`,
  },

  // SETTINGS
  settings: {
    root: ROOTS.SETTINGS,
    users: `${ROOTS.SETTINGS}/users`,
    roles: `${ROOTS.SETTINGS}/roles`,
    teams: `${ROOTS.SETTINGS}/teams`,
    customFields: `${ROOTS.SETTINGS}/custom-fields`,
    localization: `${ROOTS.SETTINGS}/localization`,
    tags: `${ROOTS.SETTINGS}/tags`,
  },
};

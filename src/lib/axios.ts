import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { CONFIG } from 'src/global-config';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

// Interceptor para agregar el token de autenticación automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const accessToken =
        sessionStorage.getItem('accessToken') || sessionStorage.getItem('jwt_access_token');

      if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginRequest = error?.config?.url?.includes('/login');
    if (typeof window !== 'undefined' && error?.response?.status === 401 && !isLoginRequest) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('jwt_access_token');
      window.location.href = paths.auth.jwt.signIn;
    }

    return Promise.reject((error.response && error.response.data) || 'Algo salió mal');
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    login: '/login',
    me: '/me',
    logout: '/logout',
    register: '/auth/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    userAccess: (uid: string) => `/users/${uid}/access`,
    twoFactor: {
      setup: '/2fa/setup', // GET → { secret, otpauth_url }
      confirm: '/2fa/confirm', // POST { code } → { token, recovery_codes[] }
    },
  },
  users: {
    list: '/users',
    create: '/users',
    show: (uid: string) => `/users/${uid}`,
    update: (uid: string) => `/users/${uid}`,
    delete: (uid: string) => `/users/${uid}`,
    access: (uid: string) => `/users/${uid}/access`,
    assignRole: (uid: string) => `/users/${uid}/roles`,
    removeRole: (uid: string, roleUid: string) => `/users/${uid}/roles/${roleUid}`,
    assignPermission: (uid: string) => `/users/${uid}/permissions`,
    removePermission: (uid: string, permUid: string) => `/users/${uid}/permissions/${permUid}`,
    assignManager: (uid: string) => `/users/${uid}/manager`,
  },
  rbac: {
    roles: '/rbac/roles',
    role: (uid: string) => `/rbac/roles/${uid}`,
    permissions: '/rbac/permissions',
  },
  plans: {
    list: '/plans',
    create: '/plans',
    update: (uid: string) => `/plans/${uid}`,
  },
  dashboard: {
    core: '/dashboard/core',
  },
  inventory: {
    master: '/inventory/master',
    availability: '/inventory/availability',
    movements: '/inventory/movements',
    adjust: '/inventory/stocks/adjust',
    transfer: '/inventory/movements/transfer',
    products: '/inventory/products',
    product: (uid: string) => `/inventory/products/${uid}`,
    warehouses: '/inventory/warehouses',
    warehouse: (uid: string) => `/inventory/warehouses/${uid}`,
    warehouseStocks: (uid: string) => `/inventory/warehouses/${uid}/stocks`,
    categories: '/inventory/categories',
    reservations: '/inventory/reservations',
    reservation: (uid: string) => `/inventory/reservations/${uid}`,
    reservationConsume: (uid: string) => `/inventory/reservations/${uid}/consume`,
    reservationsBySource: (type: string, uid: string) =>
      `/inventory/reservations/source/${type}/${uid}`,
    movementsSummary: '/inventory/movements/summary',
    report: '/inventory/report',
  },
  admin: {
    dashboard: '/admin/dashboard',
    tenants: {
      list: '/admin/tenants',
      create: '/admin/tenants',
      show: (uid: string) => `/admin/tenants/${uid}`,
      update: (uid: string) => `/admin/tenants/${uid}`,
      suspend: (uid: string) => `/admin/tenants/${uid}/suspend`,
      activate: (uid: string) => `/admin/tenants/${uid}/activate`,
      createUser: (uid: string) => `/admin/tenants/${uid}/users`,
      users: (uid: string) => `/admin/tenants/${uid}/users`,
    },
    billing: {
      list: '/admin/billing',
      markPaid: (uid: string) => `/admin/billing/${uid}/mark-paid`,
      markPaidBulk: '/admin/billing/mark-paid-bulk',
    },
    telemetry: {
      logs: '/admin/telemetry/logs',
      stats: '/admin/telemetry/stats',
      alerts: '/admin/telemetry/alerts',
      alert: (uid: string) => `/admin/telemetry/alerts/${uid}`,
      toggleAlert: (uid: string) => `/admin/telemetry/alerts/${uid}/toggle`,
    },
  },
};

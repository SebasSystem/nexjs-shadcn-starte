import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/global-config';

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
  },
  users: '/users',
  roles: '/roles',
};

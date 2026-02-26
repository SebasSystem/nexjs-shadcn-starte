import axiosInstance from 'src/lib/axios';

export function jwtDecode(token: string) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token', error);
    return null;
  }
}

export const isValidToken = (accessToken: string) => {
  if (!accessToken) return false;
  const decoded = jwtDecode(accessToken);
  if (!decoded || !decoded.exp) return true; // Si backend maneja expiración, lo asumimos válido si no trae 'exp'

  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

let expiredTimer: ReturnType<typeof setTimeout> | undefined;

export const tokenExpired = (exp: number) => {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  clearTimeout(expiredTimer);
  expiredTimer = setTimeout(() => {
    alert('Token expired!');
    sessionStorage.removeItem('accessToken');
    window.location.href = '/auth/login';
  }, timeLeft);
};

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    sessionStorage.removeItem('accessToken');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

import axiosInstance from 'src/lib/axios';
import { paths } from 'src/routes/paths';
import { JWT_STORAGE_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './constant';

export function jwtDecode(token: string) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // 🔥 Agregar padding que suele faltar y rompe window.atob
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    base64 = base64 + padding;

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
  // Si el JWT es válido pero no podemos sacar el exp, asumimos es válido
  if (!decoded || !decoded.exp) return true;

  // Fecha actual en segundos
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

let expiredTimer: ReturnType<typeof setTimeout> | undefined;

export const tokenExpired = (exp: number) => {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  clearTimeout(expiredTimer);
  //////////// Validacion temporal //////////////////////
  // JavaScript setTimeout tiene un límite de 2,147,483,647 ms (aproximadamente 24.8 días).
  // Si el token expira después de eso (como los de mock que duran años), el timer desborda y se ejecuta de inmediato.
  const MAX_TIMEOUT = 2147483647;

  if (timeLeft > MAX_TIMEOUT) {
    // eslint-disable-next-line no-console
    console.info(
      '[Auth] Token expiration is too far in the future (> 24 days). Timer will not be set.'
    );
    return;
  }

  if (timeLeft <= 0) {
    console.warn('[Auth] Token already expired.');
    // Si ya expiró, ejecutamos la lógica de limpieza
    sessionStorage.removeItem(JWT_STORAGE_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.location.href = paths.auth.jwt.signIn;
    return;
  }
  ///////////////////////////////////////////////////////
  expiredTimer = setTimeout(() => {
    alert('Session expired!');

    sessionStorage.removeItem(JWT_STORAGE_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);

    window.location.href = paths.auth.jwt.signIn;
  }, timeLeft);
};

export function setSession(accessToken: string | null) {
  if (accessToken) {
    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    const decodedToken = jwtDecode(accessToken);
    if (decodedToken?.exp) {
      tokenExpired(decodedToken.exp);
    }
  } else {
    sessionStorage.removeItem(JWT_STORAGE_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}

import axiosInstance, { endpoints } from 'src/lib/axios';
import { setSession } from 'src/shared/auth/context/jwt/utils';
import { MOCK_LOGIN_RESPONSE, getMockInitDataByEmail, MOCK_CREDENTIALS } from 'src/_mock/_auth';

// ⚠️ MOCK ONLY — clave para seleccionar el perfil correcto en getInitData
const MOCK_EMAIL_KEY = '_mock_email';

const VALID_MOCK_EMAILS = Object.values(MOCK_CREDENTIALS);

export const signInWithPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  // ⚠️ MODO MOCK — reemplazar por la llamada real cuando el backend esté listo:
  // const res = await axiosInstance.post(endpoints.auth.login, { email, password });
  // const { accessToken, refreshToken } = res.data;

  // ⚠️ MOCK ONLY — validar credenciales contra usuarios mock
  if (!VALID_MOCK_EMAILS.includes(email) || password !== 'admin123') {
    throw new Error('Credenciales incorrectas. Verificá el usuario y la contraseña.');
  }

  const { accessToken, refreshToken } = MOCK_LOGIN_RESPONSE;

  if (accessToken) {
    setSession(accessToken);
  }

  if (refreshToken) {
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  // ⚠️ MOCK ONLY — guardar email para seleccionar módulos correctos
  sessionStorage.setItem(MOCK_EMAIL_KEY, email);

  return MOCK_LOGIN_RESPONSE;
};

export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const res = await axiosInstance.post(endpoints.auth.register, {
    email,
    password,
    firstName,
    lastName,
  });
  const { accessToken } = res.data;
  sessionStorage.setItem('accessToken', accessToken);
  return res.data;
};

export const signOut = async () => {
  setSession(null);
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('jwt_access_token');
  sessionStorage.removeItem(MOCK_EMAIL_KEY);
};

export const getInitData = async () => {
  // ⚠️ MODO MOCK — reemplazar por la llamada real cuando el backend esté listo:
  // const res = await axiosInstance.get(endpoints.auth.me);
  // return res.data;

  const email = sessionStorage.getItem(MOCK_EMAIL_KEY) ?? '';
  return getMockInitDataByEmail(email);
};

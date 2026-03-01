import axiosInstance, { endpoints } from 'src/lib/axios';
import { setSession } from 'src/shared/auth/context/jwt/utils';
import { MOCK_LOGIN_RESPONSE, MOCK_INIT_DATA_RESPONSE } from 'src/_mock/_auth';

export const signInWithPassword = async ({
  email: _email,
  password: _password,
}: {
  email: string;
  password: string;
}) => {
  // ⚠️ MODO MOCK — reemplazar por la llamada real cuando el backend esté listo:
  // const res = await axiosInstance.post(endpoints.auth.login, { email, password });
  // const { accessToken, refreshToken } = res.data;

  const { accessToken, refreshToken } = MOCK_LOGIN_RESPONSE;

  if (accessToken) {
    setSession(accessToken);
  }

  if (refreshToken) {
    sessionStorage.setItem('refreshToken', refreshToken);
  }
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
};

export const getInitData = async () => {
  // ⚠️ MODO MOCK — reemplazar por la llamada real cuando el backend esté listo:
  // const res = await axiosInstance.get(endpoints.auth.me);
  // return res.data;

  return MOCK_INIT_DATA_RESPONSE;
};

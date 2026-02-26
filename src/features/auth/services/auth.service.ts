import axiosInstance, { endpoints } from 'src/lib/axios';
import { setSession } from 'src/shared/auth/context/jwt/utils';

export const signInWithPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const res = await axiosInstance.post(endpoints.auth.login, { email, password });
  const { accessToken, refreshToken } = res.data;

  setSession(accessToken);
  if (refreshToken) {
    sessionStorage.setItem('refreshToken', refreshToken);
  }
  return res.data;
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

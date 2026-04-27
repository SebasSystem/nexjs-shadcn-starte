import axiosInstance, { endpoints } from 'src/lib/axios';
import { setSession } from 'src/shared/auth/context/jwt/utils';

type AuthError = Error & { code: string };

function makeAuthError(message: string, code: string): AuthError {
  const err = new Error(message) as AuthError;
  err.code = code;
  return err;
}

type BackendErrorResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  two_factor_required?: boolean;
  data?: unknown;
};

function isTwoFactorSignal(data: BackendErrorResponse): boolean {
  return !!data?.errors?.two_factor_code || data?.two_factor_required === true;
}

export const signInWithPassword = async ({
  email,
  password,
  twoFactorCode,
}: {
  email: string;
  password: string;
  twoFactorCode?: string;
}) => {
  try {
    const res = await axiosInstance.post(endpoints.auth.login, {
      email,
      password,
      ...(twoFactorCode ? { two_factor_code: twoFactorCode } : {}),
    });

    const payload = res.data?.data ?? res.data;
    const { token, user } = payload;

    if (user?.locked_until) {
      const lockedDate = new Date(user.locked_until);
      if (lockedDate > new Date()) {
        throw makeAuthError(
          `Cuenta bloqueada hasta ${lockedDate.toLocaleString('es')}`,
          'ACCOUNT_LOCKED'
        );
      }
    }

    if (token) {
      setSession(token);
    }

    return { token, user };
  } catch (err) {
    // The axios interceptor unwraps error.response.data before rejecting,
    // so `err` may already BE the backend response body (not an axios error object).
    const maybeAlreadyAuthErr = err as AuthError;
    if (maybeAlreadyAuthErr?.code) throw err; // already a typed AuthError (e.g. ACCOUNT_LOCKED)

    const responseBody = err as BackendErrorResponse;
    if (isTwoFactorSignal(responseBody)) {
      throw makeAuthError('Se requiere código de verificación 2FA.', 'TWO_FACTOR_REQUIRED');
    }

    throw err;
  }
};

export const getUserAccess = async (uid: string): Promise<string[]> => {
  const res = await axiosInstance.get(endpoints.auth.userAccess(uid));
  const payload = res.data?.data ?? res.data;
  const { effective_permissions } = payload;
  return (effective_permissions ?? []).map((p: { key: string }) => p.key);
};

export const getInitData = async () => {
  const meRes = await axiosInstance.get(endpoints.auth.me);
  const user = meRes.data?.data ?? meRes.data;
  const permissions = await getUserAccess(user.uid);
  return { user, permissions };
};

export const signOut = async () => {
  try {
    await axiosInstance.post(endpoints.auth.logout);
  } catch {
    // best-effort — server may already have invalidated the token
  }
  setSession(null);
};

export const forgotPassword = async (email: string): Promise<void> => {
  await axiosInstance.post(endpoints.auth.forgotPassword, { email });
};

export const resetPassword = async ({
  email,
  token,
  password,
}: {
  email: string;
  token: string;
  password: string;
}): Promise<void> => {
  await axiosInstance.post(endpoints.auth.resetPassword, {
    email,
    token,
    password,
    password_confirmation: password,
  });
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

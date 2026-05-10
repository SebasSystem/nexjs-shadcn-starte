import axiosInstance, { endpoints } from 'src/lib/axios';
import { setSession } from 'src/shared/auth/context/jwt/utils';
import type { Module } from 'src/shared/auth/types';

type AuthError = Error & { code: string };
type SetupError = AuthError & { setupToken: string };

function makeAuthError(message: string, code: string): AuthError {
  const err = new Error(message) as AuthError;
  err.code = code;
  return err;
}

function makeSetupError(message: string, setupToken: string): SetupError {
  const err = new Error(message) as SetupError;
  err.code = 'TWO_FACTOR_SETUP_REQUIRED';
  err.setupToken = setupToken;
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
  recoveryCode,
}: {
  email: string;
  password: string;
  twoFactorCode?: string;
  recoveryCode?: string;
}) => {
  try {
    const res = await axiosInstance.post(endpoints.auth.login, {
      email,
      password,
      ...(twoFactorCode ? { two_factor_code: twoFactorCode } : {}),
      ...(recoveryCode ? { recovery_code: recoveryCode } : {}),
    });

    const payload = res.data?.data ?? res.data;
    const { token, user, requires_two_factor_setup } = payload;
    if (user?.locked_until) {
      const lockedDate = new Date(user.locked_until);
      if (lockedDate > new Date()) {
        throw makeAuthError(
          `Cuenta bloqueada hasta ${lockedDate.toLocaleString('es')}`,
          'ACCOUNT_LOCKED'
        );
      }
    }

    // 2FA setup required — token is temporary, do NOT set as session yet
    if (requires_two_factor_setup) {
      throw makeSetupError('Debes configurar 2FA antes de acceder.', token);
    }

    if (token) {
      setSession(token);
    }

    return { token, user };
  } catch (err) {
    const maybeAlreadyAuthErr = err as AuthError;
    const OUR_CODES = ['TWO_FACTOR_REQUIRED', 'TWO_FACTOR_SETUP_REQUIRED', 'ACCOUNT_LOCKED'];
    if (OUR_CODES.includes(maybeAlreadyAuthErr?.code)) throw err;

    const responseBody =
      (err as { response?: { data?: BackendErrorResponse } }).response?.data ??
      (err as { data?: BackendErrorResponse }).data ??
      (err as BackendErrorResponse);
    if (isTwoFactorSignal(responseBody)) {
      throw makeAuthError('Se requiere código de verificación 2FA.', 'TWO_FACTOR_REQUIRED');
    }

    throw err;
  }
};

// GET /2fa/setup — returns secret and otpauth_url to generate QR
export const getTwoFactorSetupData = async (
  setupToken: string
): Promise<{ otpauthUrl: string; secret: string }> => {
  const res = await axiosInstance.get(endpoints.auth.twoFactor.setup, {
    headers: { Authorization: `Bearer ${setupToken}` },
  });
  const payload = res.data?.data ?? res.data;
  return {
    otpauthUrl: payload.otpauth_url as string,
    secret: (payload.secret ?? '') as string,
  };
};

// POST /2fa/confirm
export const confirmTwoFactorSetup = async (
  setupToken: string,
  code: string
): Promise<{ token: string; recoveryCodes: string[] }> => {
  const res = await axiosInstance.post(
    endpoints.auth.twoFactor.confirm,
    { code },
    { headers: { Authorization: `Bearer ${setupToken}` } }
  );
  const payload = res.data?.data ?? res.data;
  return {
    token: payload.token as string,
    recoveryCodes: (payload.recovery_codes ?? []) as string[],
  };
};

export const init = async (): Promise<{
  user: {
    uid: string;
    name: string;
    email: string;
    tenant_uid?: string;
    two_factor_enabled?: boolean;
    role?: string;
    avatar_url?: string;
  };
  tenant?: { uid: string; name: string; plan: string; logo_url?: string };
  modules: Module[];
  localization?: {
    currency: string;
    currency_symbol: string;
    locale: string;
    timezone: string;
    date_format: string;
    language: string;
    user_timezone?: string;
  };
}> => {
  const res = await axiosInstance.get(endpoints.auth.init);
  const payload = res.data?.data ?? res.data;
  return {
    user: payload.user as {
      uid: string;
      name: string;
      email: string;
      tenant_uid?: string;
      two_factor_enabled?: boolean;
      role?: string;
      avatar_url?: string;
    },
    tenant: payload.tenant,
    modules: (payload.modules ?? []) as Module[],
    localization: payload.localization,
  };
};

/** @deprecated Use init() instead — single call to /api/auth/init */
export const getUserAccess = async (uid: string): Promise<string[]> => {
  const res = await axiosInstance.get(endpoints.auth.userAccess(uid));
  const payload = res.data?.data ?? res.data;
  const { effective_permissions } = payload;
  return (effective_permissions ?? []).map((p: { key: string }) => p.key);
};

/** @deprecated Use init() instead — single call to /api/auth/init */
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

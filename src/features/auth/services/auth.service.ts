import axiosInstance, { endpoints } from 'src/lib/axios';

// ─── Thin service — cada método llama a axios y retorna res.data ────────────
// Reglas:
//   - Sin try/catch → los hooks/componentes manejan errores
//   - Sin side-effects (setSession, sessionStorage) → el consumidor los aplica
//   - Sin business logic → el hook/componente decide qué hacer con los datos
//   - Sin field mapping → el backend dicta la forma de los datos

// ─── Login ────────────────────────────────────────────────────────────────────

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
  const res = await axiosInstance.post(endpoints.auth.login, {
    email,
    password,
    ...(twoFactorCode ? { two_factor_code: twoFactorCode } : {}),
    ...(recoveryCode ? { recovery_code: recoveryCode } : {}),
  });
  return res.data;
};

// ─── 2FA Setup ────────────────────────────────────────────────────────────────

export const getTwoFactorSetupData = async (setupToken: string) => {
  const res = await axiosInstance.get(endpoints.auth.twoFactor.setup, {
    headers: { Authorization: `Bearer ${setupToken}` },
  });
  return res.data;
};

export const confirmTwoFactorSetup = async (setupToken: string, code: string) => {
  const res = await axiosInstance.post(
    endpoints.auth.twoFactor.confirm,
    { code },
    { headers: { Authorization: `Bearer ${setupToken}` } }
  );
  return res.data;
};

// ─── Session init ─────────────────────────────────────────────────────────────
//
// GET /auth/init — PlatformInitService::init()
// Response: { user, tenant, modules, localization, permissions: { effective: string[] } }

export const init = async () => {
  const res = await axiosInstance.get(endpoints.auth.init);
  return res.data;
};

// ─── Auth actions ─────────────────────────────────────────────────────────────

export const signOut = async () => {
  await axiosInstance.post(endpoints.auth.logout);
};

export const forgotPassword = async (email: string) => {
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
}) => {
  await axiosInstance.post(endpoints.auth.resetPassword, {
    email,
    token,
    password,
    password_confirmation: password,
  });
};

export type UserType = {
  uid: string;
  name: string;
  email: string;
  role?: string;
  tenant_uid?: string;
  two_factor_enabled?: boolean;
  locked_until?: string | null;
  permissions: string[];
} | null;

export type AuthUser = UserType;

export type Module = {
  key: string;
  label: string;
  enabled: boolean;
  permissions: string[];
};

export type AuthState = {
  user: UserType;
  loading: boolean;
  permissions: string[];
  modules: Module[];
};

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  permissions: string[];
  modules: Module[];
  hasPermission: (key: string) => boolean;
  checkUserSession: () => Promise<{ permissions: string[]; modules: Module[]; role?: string }>;
};

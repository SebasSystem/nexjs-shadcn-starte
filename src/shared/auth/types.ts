export type UserType = {
  uid: string;
  name: string;
  email: string;
  tenant_uid?: string;
  two_factor_enabled?: boolean;
  locked_until?: string | null;
  permissions: string[];
} | null;

export type AuthUser = UserType;
export type AuthState = { user: UserType; loading: boolean; permissions: string[] };

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  permissions: string[];
  hasPermission: (key: string) => boolean;
  checkUserSession: () => Promise<void>;
};

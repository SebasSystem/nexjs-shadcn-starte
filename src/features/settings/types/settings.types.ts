// ─────────────────────────────────────────────────────────────────────────────
// Settings — Domain types
// ─────────────────────────────────────────────────────────────────────────────

// ── Users ──────────────────────────────────────────────────────────────────
export type UserStatus = 'ACTIVO' | 'INACTIVO';

export interface SettingsUser {
  uid: string;
  name: string;
  email: string;
  role_uid?: string;
  role_name?: string;
  team_uid?: string;
  team_name?: string;
  status: UserStatus;
  is_active?: boolean;
  last_login_at: string;
  created_at: string;
}

// ── Roles & Permissions ────────────────────────────────────────────────────

/** New backend-aligned Permission type (replaces ModulePermission) */
export interface Permission {
  uid: string;
  key: string;
  module: string;
  action: string;
  description: string;
}

/** @deprecated Use Permission instead — backend expects per-permission UIDs */
export type PermissionAction = 'ver' | 'crear' | 'editar' | 'eliminar';

/** @deprecated Use Permission[] + permission_uids instead */
export interface ModulePermission {
  module_uid: string;
  module_name: string;
  actions: PermissionAction[];
}

export interface Role {
  uid: string;
  name: string;
  key: string;
  description: string;
  total_users?: number;
  /** @deprecated Use permission_uids instead */
  permissions?: ModulePermission[];
  permission_uids?: string[];
  is_system: boolean;
  created_at: string;
}

// ── Teams ───────────────────────────────────────────────────────────────────
export interface TeamMember {
  user_uid: string;
  user_name: string;
  role_name: string;
  assigned_clients: number;
}

export interface Team {
  uid: string;
  name: string;
  leader_uid: string;
  leader_name: string;
  members_count: number;
  members: TeamMember[];
  created_at: string;
}

// ── Custom Fields ───────────────────────────────────────────────────────────
export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';
export type CustomFieldModule = 'contacts' | 'companies' | 'opportunities' | 'products';

export interface CustomField {
  uid: string;
  name: string;
  label: string;
  type: CustomFieldType;
  module: CustomFieldModule;
  required: boolean;
  options?: string[];
  created_at: string;
}

// ── Localization ────────────────────────────────────────────────────────────
export interface LocalizationConfig {
  timezone: string;
  currency: string;
  currency_symbol: string;
  date_format: string;
  locale: string;
}

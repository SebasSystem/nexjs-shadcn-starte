export type PartnerType = 'distributor' | 'reseller' | 'ally';
export type PartnerStatus = 'active' | 'inactive' | 'prospect';
export type PartnerOpportunityStatus =
  | 'pending'
  | 'validated'
  | 'closed'
  | 'won'
  | 'lost'
  | 'cancelled';
export type MaterialType = 'sales' | 'training';

// ─── Status configs ───────────────────────────────────────────────────────────

export const PARTNER_STATUS_CONFIG: Record<
  PartnerStatus,
  { label: string; color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' }
> = {
  active: { label: 'Activo', color: 'success' },
  inactive: { label: 'Inactivo', color: 'error' },
  prospect: { label: 'Prospecto', color: 'warning' },
};

export const PARTNER_TYPE_CONFIG: Record<
  PartnerType,
  {
    label: string;
    color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' | 'primary';
  }
> = {
  distributor: { label: 'Distribuidor', color: 'info' },
  reseller: { label: 'Reseller', color: 'primary' },
  ally: { label: 'Aliado', color: 'secondary' },
};

export const PARTNER_OPP_STATUS_CONFIG: Record<
  PartnerOpportunityStatus,
  { label: string; color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' }
> = {
  pending: { label: 'Pendiente', color: 'warning' },
  validated: { label: 'Validada', color: 'info' },
  closed: { label: 'Cerrada', color: 'secondary' },
  won: { label: 'Ganada', color: 'success' },
  lost: { label: 'Perdida', color: 'error' },
  cancelled: { label: 'Cancelada', color: 'secondary' },
};

export const MATERIAL_TYPE_CONFIG: Record<MaterialType, { label: string; icon: string }> = {
  sales: { label: 'Ventas', icon: 'Presentation' },
  training: { label: 'Capacitación', icon: 'GraduationCap' },
};

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface Partner {
  uid: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contact_name: string;
  contact_email: string;
  phone?: string;
  region: string;
  registered_opportunities: number;
  converted_deals: number;
  joined_date: string;
  notes?: string;
}

export interface PartnerOpportunity {
  uid: string;
  partner_uid: string;
  partner_name: string;
  client_name: string;
  client_email?: string;
  product: string;
  estimated_value: number;
  currency: string;
  status: PartnerOpportunityStatus;
  registered_date: string;
  notes?: string;
  assigned_to_internal?: string;
  assigned_to_internal_uid?: string;
  created_at: string;
}

export interface PortalMaterial {
  uid: string;
  title: string;
  description: string | null;
  type: MaterialType;
  file_name: string;
  file_size: string;
  uploaded_at: string;
  uploaded_by: string | null;
  tags: string[];
  download_count: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface PartnerPayload {
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contact_name: string;
  contact_email: string;
  phone?: string;
  region: string;
  joined_date: string;
  notes?: string;
}

export interface PartnerOpportunityPayload {
  partner_uid: string;
  partner_name: string;
  client_name: string;
  client_email?: string;
  product: string;
  estimated_value: number;
  currency: string;
  status: PartnerOpportunityStatus;
  registered_date: string;
  notes?: string;
  assigned_to_internal_uid?: string;
}

export interface PortalMaterialPayload {
  title: string;
  description: string;
  type: MaterialType;
  file_name: string;
  file_size: string;
  uploaded_at: string;
  uploaded_by: string;
  tags: string[];
}

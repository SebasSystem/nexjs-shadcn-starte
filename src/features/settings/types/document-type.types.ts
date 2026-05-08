export interface DocumentType {
  uid: string;
  name: string;
  description: string | null;
  validity_days: number | null;
  is_required: boolean;
  is_active: boolean;
}

export interface DocumentTypePayload {
  name: string;
  description?: string;
  validity_days?: number;
  is_required?: boolean;
  is_active?: boolean;
}

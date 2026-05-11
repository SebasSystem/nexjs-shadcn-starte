export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'ordered'
  | 'partially_received'
  | 'partial_received'
  | 'received'
  | 'closed'
  | 'cancelled'
  | 'partial_paid'
  | 'paid'
  | 'overdue';

export interface PurchaseOrder {
  uid: string;
  purchase_number: string;
  status: PurchaseOrderStatus;
  currency: string;
  paid_total: number;
  total: number;
  received_total: number;
  outstanding_total: number;
  is_fully_received: boolean;
  is_closed: boolean;
  ordered_at: string | null;
  expected_at: string | null;
  due_date: string | null;
  received_at: string | null;
  closed_at: string | null;
  notes: string | null;
  supplier: { uid: string; name: string } | null;
  owner: { uid: string; name: string } | null;
  cost_center: { uid: string; name: string } | null;
  created_at: string;
}

export interface PurchaseOrderPayload {
  purchase_number: string;
  supplier_uid: string;
  cost_center_uid?: string;
  currency?: string;
  expected_at?: string;
  due_date?: string;
  notes?: string;
  items?: { product_uid: string; quantity: number; unit_cost: number; description?: string }[];
}

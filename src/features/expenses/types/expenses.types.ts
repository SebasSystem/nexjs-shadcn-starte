export interface ExpenseCategory {
  uid: string;
  name: string;
  description: string | null;
}

export interface Supplier {
  uid: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  is_active: boolean;
}

export interface CostCenter {
  uid: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export interface Expense {
  uid: string;
  expense_number: string;
  description: string;
  amount: number;
  expense_date: string;
  category: ExpenseCategory | null;
  supplier: Supplier | null;
  cost_center: CostCenter | null;
  expenseable_type: string | null;
  expenseable_name: string | null;
  created_at: string;
}

export interface ExpensePayload {
  description: string;
  amount: number;
  expense_date: string;
  expense_category_uid?: string;
  supplier_uid?: string;
  cost_center_uid?: string;
  expenseable_type?: string;
  expenseable_uid?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}

export interface SupplierPayload {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  tax_id?: string;
  is_active?: boolean;
}

export interface CostCenterPayload {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

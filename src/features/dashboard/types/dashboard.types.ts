export interface DashboardSummary {
  new_customers_today: number;
  overdue_tasks_today: number;
  tasks_supported: boolean;
}

export interface DashboardBreakdown {
  accounts_created_today: number;
  contacts_created_today: number;
  crm_entities_created_today: number;
  tasks_due_today: number;
}

export interface DashboardTotals {
  accounts: number;
  contacts: number;
  crm_entities: number;
  tags: number;
  tasks: number;
}

export interface DashboardKpis {
  conversion_rate: number;
  mrr: number;
  at_risk_count: number;
}

export interface TopTag {
  uid: string;
  name: string;
  color: string;
  category: string;
  usage_count: number;
}

export interface OverdueTask {
  uid: string;
  title: string;
  account_name: string | null;
  assigned_to_name: string | null;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RecentQuotation {
  uid: string;
  number: string;
  account_name: string;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  created_at: string;
}

export interface LowStockProduct {
  uid: string;
  name: string;
  sku: string;
  current_stock: number;
  minimum_stock: number;
  stock_status: 'critical' | 'low';
}

export interface RecentActivity {
  uid: string;
  type: 'task' | 'reminder' | 'meeting';
  title: string;
  status: 'pending' | 'completed' | 'overdue';
  scheduled_at: string;
  owner: { uid: string; name: string } | null;
  assigned_user: { uid: string; name: string } | null;
  activityable: { uid: string; name: string } | null;
}

export interface MonthlySalesPoint {
  month: string;
  label: string;
  actual: number;
  goal: number | null;
}

export interface DashboardCoreData {
  summary: DashboardSummary;
  breakdown: DashboardBreakdown;
  totals: DashboardTotals;
  kpis: DashboardKpis;
  top_tags: TopTag[];
  overdue_tasks: OverdueTask[];
  recent_quotations: RecentQuotation[];
  low_stock_products: LowStockProduct[];
  monthly_sales: MonthlySalesPoint[];
}

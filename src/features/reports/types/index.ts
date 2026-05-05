// ─── Report Data Shapes ────────────────────────────────────────────────────────

export interface ReportKpis {
  [key: string]: string | number;
}

export interface ReportChartData {
  series: number[] | { name: string; data: number[] }[];
  labels?: string[];
  categories?: string[];
}

export interface ReportTableRow {
  [key: string]: unknown;
}

export interface SalesReport {
  kpis: ReportKpis;
  chart_data: ReportChartData;
  table_data: ReportTableRow[];
}

export interface InventoryReport {
  kpis: ReportKpis;
  chart_data: ReportChartData;
  table_data: ReportTableRow[];
  most_critical?: {
    sku: string;
    name: string;
    available: number;
    min_stock: number;
  } | null;
}

// ─── Filter Types ──────────────────────────────────────────────────────────────

export interface ReportFilterParams {
  period: string;
  warehouse?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
}

export interface WarehouseOption {
  value: string;
  label: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface ReportFilterOptions {
  warehouses: WarehouseOption[];
  categories: CategoryOption[];
}

// ─── Tab Identifiers ───────────────────────────────────────────────────────────

export type SalesReportTab = 'status' | 'products' | 'distributors' | 'vs';

export type InventoryReportTab = 'warehouse' | 'risk' | 'movements' | 'category' | 'b2b';

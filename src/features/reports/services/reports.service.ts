import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  CategoryOption,
  InventoryReport,
  InventoryReportTab,
  ReportFilterOptions,
  ReportFilterParams,
  SalesReport,
  SalesReportTab,
  WarehouseOption,
} from '../types';

// ─── Mappers ───────────────────────────────────────────────────────────────────

function mapSalesReport(raw: Record<string, unknown>): SalesReport {
  const data = (raw.data ?? raw) as Record<string, unknown>;
  return {
    kpis: (data.kpis as Record<string, string | number>) ?? {},
    chart_data: {
      series: ((data.chart_data as Record<string, unknown>)?.series as number[]) ?? [],
      labels: (data.chart_data as Record<string, unknown>)?.labels as string[],
      categories: (data.chart_data as Record<string, unknown>)?.categories as string[],
    },
    table_data: (data.table_data as Record<string, unknown>[]) ?? [],
  };
}

function mapInventoryReport(raw: Record<string, unknown>): InventoryReport {
  const data = (raw.data ?? raw) as Record<string, unknown>;
  return {
    ...mapSalesReport(raw),
    most_critical: (data.most_critical as InventoryReport['most_critical']) ?? null,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildQuery(filters: ReportFilterParams): Record<string, string> {
  const q: Record<string, string> = {};
  if (filters.period) q.period = filters.period;
  if (filters.warehouse && filters.warehouse !== 'all') q.warehouse = filters.warehouse;
  if (filters.category && filters.category !== 'all') q.category = filters.category;
  if (filters.start_date) q.start_date = filters.start_date;
  if (filters.end_date) q.end_date = filters.end_date;
  return q;
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const reportsService = {
  async getSalesReport(tab: SalesReportTab, filters: ReportFilterParams): Promise<SalesReport> {
    const res = await axiosInstance.get(endpoints.reports.sales, {
      params: { tab, ...buildQuery(filters) },
    });
    return mapSalesReport(res.data);
  },

  async getInventoryReport(
    tab: InventoryReportTab,
    filters: ReportFilterParams
  ): Promise<InventoryReport> {
    const res = await axiosInstance.get(endpoints.reports.inventory, {
      params: { tab, ...buildQuery(filters) },
    });
    return mapInventoryReport(res.data);
  },

  async getFilterOptions(): Promise<ReportFilterOptions> {
    const res = await axiosInstance.get(endpoints.reports.filters);
    const data = (res.data?.data ?? res.data) as Record<string, unknown>;
    return {
      warehouses: ((data.warehouses as Record<string, unknown>[]) ?? []).map(
        (w): WarehouseOption => ({
          value: w.value as string,
          label: w.label as string,
        })
      ),
      categories: ((data.categories as Record<string, unknown>[]) ?? []).map(
        (c): CategoryOption => ({
          value: c.value as string,
          label: c.label as string,
        })
      ),
    };
  },
};

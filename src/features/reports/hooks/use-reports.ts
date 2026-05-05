'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { reportsService } from '../services/reports.service';
import type {
  InventoryReport,
  InventoryReportTab,
  ReportFilterOptions,
  ReportFilterParams,
  SalesReport,
  SalesReportTab,
} from '../types';

// ─── Sales Report ──────────────────────────────────────────────────────────────

export function useSalesReport(tab: SalesReportTab, filters: ReportFilterParams) {
  const filterObj: Record<string, string> = {
    period: filters.period,
    ...(filters.warehouse && filters.warehouse !== 'all' ? { warehouse: filters.warehouse } : {}),
    ...(filters.category && filters.category !== 'all' ? { category: filters.category } : {}),
    ...(filters.start_date ? { start_date: filters.start_date } : {}),
    ...(filters.end_date ? { end_date: filters.end_date } : {}),
  };

  const { data, isLoading, isError, refetch } = useQuery<SalesReport>({
    queryKey: queryKeys.reports.sales(tab, filterObj),
    queryFn: () => reportsService.getSalesReport(tab, filters),
    staleTime: 5 * 60 * 1000,
  });

  return { data, isLoading, isError, refetch };
}

// ─── Inventory Report ──────────────────────────────────────────────────────────

export function useInventoryReport(tab: InventoryReportTab, filters: ReportFilterParams) {
  const filterObj: Record<string, string> = {
    period: filters.period,
    ...(filters.warehouse && filters.warehouse !== 'all' ? { warehouse: filters.warehouse } : {}),
    ...(filters.category && filters.category !== 'all' ? { category: filters.category } : {}),
    ...(filters.start_date ? { start_date: filters.start_date } : {}),
    ...(filters.end_date ? { end_date: filters.end_date } : {}),
  };

  const { data, isLoading, isError, refetch } = useQuery<InventoryReport>({
    queryKey: queryKeys.reports.inventory(tab, filterObj),
    queryFn: () => reportsService.getInventoryReport(tab, filters),
    staleTime: 5 * 60 * 1000,
  });

  return { data, isLoading, isError, refetch };
}

// ─── Filter Options ────────────────────────────────────────────────────────────

export function useReportFilters() {
  const { data, isLoading } = useQuery<ReportFilterOptions>({
    queryKey: queryKeys.reports.filters,
    queryFn: () => reportsService.getFilterOptions(),
    staleTime: 10 * 60 * 1000,
  });

  return {
    filterOptions: data ?? { warehouses: [], categories: [] },
    isLoading,
  };
}

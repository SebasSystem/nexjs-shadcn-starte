'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/lib/query-keys';

import { reportsService } from '../services/reports.service';
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

// ─── Sales Report ──────────────────────────────────────────────────────────────

export function useSalesReport(tab: SalesReportTab, filters: ReportFilterParams) {
  const filterObj: Record<string, string> = {
    period: filters.period,
    ...(filters.warehouse && filters.warehouse !== 'all' ? { warehouse: filters.warehouse } : {}),
    ...(filters.category && filters.category !== 'all' ? { category: filters.category } : {}),
    ...(filters.start_date ? { start_date: filters.start_date } : {}),
    ...(filters.end_date ? { end_date: filters.end_date } : {}),
    // TODO(backend-pendiente): Backend ReportService no soporta `search`.
    // Se incluye en queryKey y se envía al servicio para que esté listo
    // cuando el backend lo implemente.
    ...(filters.search ? { search: filters.search } : {}),
  };

  const queryParams = { tab, ...filterObj };

  const { data, isLoading, isError, refetch } = useQuery<SalesReport>({
    queryKey: queryKeys.reports.sales(tab, filterObj),
    queryFn: () => reportsService.getSalesReport(queryParams),
    staleTime: 0,
    placeholderData: keepPreviousData,
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
    // TODO(backend-pendiente): Backend ReportService no soporta `search`.
    // Se incluye en queryKey y se envía al servicio para que esté listo
    // cuando el backend lo implemente.
    ...(filters.search ? { search: filters.search } : {}),
  };

  const queryParams = { tab, ...filterObj };

  const { data, isLoading, isError, refetch } = useQuery<InventoryReport>({
    queryKey: queryKeys.reports.inventory(tab, filterObj),
    queryFn: () => reportsService.getInventoryReport(queryParams),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  return { data, isLoading, isError, refetch };
}

// ─── Filter Options ────────────────────────────────────────────────────────────

export function useReportFilters() {
  const { data, isLoading } = useQuery<ReportFilterOptions>({
    queryKey: queryKeys.reports.filters,
    queryFn: async () => {
      const res = await reportsService.getFilterOptions();
      const payload: Record<string, unknown> = ((res as Record<string, unknown>)?.data ??
        res) as Record<string, unknown>;
      return {
        warehouses: ((payload.warehouses as Record<string, unknown>[]) ?? []).map(
          (w): WarehouseOption => ({
            value: w.value as string,
            label: w.label as string,
          })
        ),
        categories: ((payload.categories as Record<string, unknown>[]) ?? []).map(
          (c): CategoryOption => ({
            value: c.value as string,
            label: c.label as string,
          })
        ),
      };
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  return {
    filterOptions: data ?? { warehouses: [], categories: [] },
    isLoading,
  };
}

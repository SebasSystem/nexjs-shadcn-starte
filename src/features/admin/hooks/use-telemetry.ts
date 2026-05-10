'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LogFilters, telemetryService } from 'src/features/admin/services/telemetry.service';
import {
  Alerta,
  LogEntry,
  TelemetryStats,
  TenantErrorByTenant,
} from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

const C_LOGS = 'telemetry:logs';
const C_ALERTS = 'telemetry:alerts';

export function useTelemetry(logFilters: Omit<LogFilters, 'page' | 'per_page'> = {}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>(cache.get<Alerta[]>(C_ALERTS) ?? []);
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [errorsByTenant, setErrorsByTenant] = useState<TenantErrorByTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pagination = usePaginationParams();
  const { params, setTotal } = pagination;
  const hasFetchedAlerts = useRef(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams: LogFilters = {
        page: params.page,
        per_page: params.per_page,
        ...(logFilters.nivel && { nivel: logFilters.nivel }),
        ...(logFilters.from && { from: logFilters.from }),
        ...(logFilters.to && { to: logFilters.to }),
      };

      const [logRes, summaryData] = await Promise.all([
        telemetryService.getLogs(queryParams),
        !hasFetchedAlerts.current ? telemetryService.getSummary() : telemetryService.getSummary(),
      ]);

      const meta = extractPaginationMeta(logRes);
      if (meta) setTotal(meta.total);
      const logData = ((logRes as { data?: LogEntry[] }).data ?? []) as LogEntry[];
      cache.set(C_LOGS, logData);
      setLogs(logData);

      const { errors_by_tenant, ...statsData } = summaryData;
      setStats(statsData);
      setErrorsByTenant(errors_by_tenant);
    } catch {
      // keep existing data
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.per_page, logFilters.nivel, logFilters.from, logFilters.to, setTotal]);

  const fetchAlertas = useCallback(async () => {
    const alertaData = await telemetryService.getAlertas();
    cache.set(C_ALERTS, alertaData);
    setAlertas(alertaData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchAlertas();
    hasFetchedAlerts.current = true;
  }, [fetchAlertas]);

  const toggleAlerta = useCallback(
    async (uid: string) => {
      const updated = await telemetryService.toggleAlerta(uid);
      await fetchAlertas();
      return updated;
    },
    [fetchAlertas]
  );

  const saveAlerta = useCallback(
    async (data: Omit<Alerta, 'uid'>) => {
      const created = await telemetryService.saveAlerta(data);
      await fetchAlertas();
      return created;
    },
    [fetchAlertas]
  );

  const updateAlerta = useCallback(
    async (uid: string, data: Partial<Alerta>) => {
      const updated = await telemetryService.updateAlerta(uid, data as Record<string, unknown>);
      await fetchAlertas();
      return updated;
    },
    [fetchAlertas]
  );

  const deleteAlerta = useCallback(
    async (uid: string) => {
      await telemetryService.deleteAlerta(uid);
      await fetchAlertas();
    },
    [fetchAlertas]
  );

  return {
    logs,
    alertas,
    stats,
    errorsByTenant,
    isLoading,
    refetch: fetchData,
    toggleAlerta,
    saveAlerta,
    updateAlerta,
    deleteAlerta,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { telemetryService } from 'src/features/admin/services/telemetry.service';
import { Alerta, LogEntry, TelemetryStats } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

const C_LOGS = 'telemetry:logs',
  C_ALERTS = 'telemetry:alerts',
  C_STATS = 'telemetry:stats';

export function useTelemetry() {
  const cachedLogs = cache.get<LogEntry[]>(C_LOGS);
  const cachedAlertas = cache.get<Alerta[]>(C_ALERTS);
  const cachedStats = cache.get<TelemetryStats>(C_STATS);
  const hasCacheRef = useRef(!!(cachedLogs || cachedAlertas || cachedStats));

  const [logs, setLogs] = useState<LogEntry[]>(cachedLogs ?? []);
  const [alertas, setAlertas] = useState<Alerta[]>(cachedAlertas ?? []);
  const [stats, setStats] = useState<TelemetryStats | null>(cachedStats ?? null);
  const [isLoading, setIsLoading] = useState(!hasCacheRef.current);
  const pagination = usePaginationParams();
  const { params, setTotal } = pagination;

  const fetchData = useCallback(async () => {
    setIsLoading(!hasCacheRef.current);
    try {
      const [logRes, alertaData, statsData] = await Promise.all([
        telemetryService.getLogs(params),
        telemetryService.getAlertas(),
        telemetryService.getStats(),
      ]);
      const meta = extractPaginationMeta(logRes);
      if (meta) setTotal(meta.total);
      const logData = ((logRes as unknown as { data?: LogEntry[] }).data ?? []) as LogEntry[];
      cache.set(C_LOGS, logData);
      cache.set(C_ALERTS, alertaData);
      cache.set(C_STATS, statsData);
      setLogs(logData);
      setAlertas(alertaData);
      setStats(statsData);
      hasCacheRef.current = true;
    } catch {
      /* mantener data previa en caso de error */
    } finally {
      setIsLoading(false);
    }
  }, [params, setTotal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAlertas = useCallback(async () => {
    const alertaData = await telemetryService.getAlertas();
    cache.set(C_ALERTS, alertaData);
    setAlertas(alertaData);
  }, []);

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

  return {
    logs,
    alertas,
    stats,
    isLoading,
    refetch: fetchData,
    toggleAlerta,
    saveAlerta,
    updateAlerta,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { telemetryService } from 'src/features/admin/services/telemetry.service';
import { Alerta, LogEntry, TelemetryStats } from 'src/features/admin/types/admin.types';
import { cache } from 'src/lib/cache';

const C_LOGS = 'telemetry:logs',
  C_ALERTS = 'telemetry:alerts',
  C_STATS = 'telemetry:stats';
const EMPTY_STATS: TelemetryStats = {
  uptime_global_percent: 100,
  latencia_p95_ms: null,
  errores_24h: 0,
  warnings_24h: 0,
  tenants_with_errors: 0,
  active_alerts: 0,
};

export function useTelemetry() {
  const cachedLogs = cache.get<LogEntry[]>(C_LOGS);
  const cachedAlertas = cache.get<Alerta[]>(C_ALERTS);
  const cachedStats = cache.get<TelemetryStats>(C_STATS);
  const hasAnyCache = !!(cachedLogs || cachedAlertas || cachedStats);

  const [logs, setLogs] = useState<LogEntry[]>(cachedLogs ?? []);
  const [alertas, setAlertas] = useState<Alerta[]>(cachedAlertas ?? []);
  const [stats, setStats] = useState<TelemetryStats>(cachedStats ?? EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(!hasAnyCache);

  const fetchData = useCallback(async () => {
    setIsLoading(!hasAnyCache);
    try {
      const [logData, alertaData, statsData] = await Promise.all([
        telemetryService.getLogs(),
        telemetryService.getAlertas(),
        telemetryService.getStats(),
      ]);
      cache.set(C_LOGS, logData);
      cache.set(C_ALERTS, alertaData);
      cache.set(C_STATS, statsData);
      setLogs(logData);
      setAlertas(alertaData);
      setStats(statsData);
    } catch {
      setStats(EMPTY_STATS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleAlerta = useCallback(async (uid: string) => {
    const updated = await telemetryService.toggleAlerta(uid);
    cache.invalidate(C_ALERTS);
    setAlertas((prev) => prev.map((a) => (a.uid === uid ? updated : a)));
    return updated;
  }, []);

  const saveAlerta = useCallback(async (data: Omit<Alerta, 'uid'>) => {
    const created = await telemetryService.saveAlerta(data);
    cache.invalidate(C_ALERTS);
    setAlertas((prev) => [...prev, created]);
    return created;
  }, []);

  const updateAlerta = useCallback(async (uid: string, data: Partial<Alerta>) => {
    const updated = await telemetryService.updateAlerta(uid, data as Record<string, unknown>);
    cache.invalidate(C_ALERTS);
    setAlertas((prev) => prev.map((a) => (a.uid === uid ? updated : a)));
    return updated;
  }, []);

  return {
    logs,
    alertas,
    stats,
    isLoading,
    refetch: fetchData,
    toggleAlerta,
    saveAlerta,
    updateAlerta,
  };
}

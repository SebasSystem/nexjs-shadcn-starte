'use client';

import { useState, useEffect, useCallback } from 'react';
import { LogEntry, Alerta } from 'src/features/admin/types/admin.types';
import { telemetryService } from 'src/features/admin/services/telemetry.service';

export function useTelemetry() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [logsData, alertasData] = await Promise.all([
        telemetryService.getLogs(),
        telemetryService.getAlertas(),
      ]);
      setLogs(logsData);
      setAlertas(alertasData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleAlerta = useCallback(async (id: string) => {
    const updated = await telemetryService.toggleAlerta(id);
    setAlertas((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const saveAlerta = useCallback(async (data: Omit<Alerta, 'id'>) => {
    const newAlerta = await telemetryService.saveAlerta(data);
    setAlertas((prev) => [...prev, newAlerta]);
    return newAlerta;
  }, []);

  const updateAlerta = useCallback(async (id: string, data: Partial<Alerta>) => {
    const updated = await telemetryService.updateAlerta(id, data);
    setAlertas((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  return {
    logs,
    alertas,
    isLoading,
    refetch: fetchData,
    toggleAlerta,
    saveAlerta,
    updateAlerta,
  };
}

import type {
  Alerta,
  AlertaPayload,
  TelemetryStats,
  TenantErrorByTenant,
} from 'src/features/admin/types/admin.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export interface LogFilters {
  nivel?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface TelemetrySummary extends TelemetryStats {
  errors_by_tenant: TenantErrorByTenant[];
}

export const telemetryService = {
  async getLogs(params?: LogFilters): Promise<unknown> {
    const res = await axiosInstance.get(endpoints.admin.telemetry.logs, { params });
    return res.data;
  },
  async getSummary(): Promise<TelemetrySummary> {
    const res = await axiosInstance.get(endpoints.admin.telemetry.summary);
    const d = res.data.data;
    return {
      uptime_global_percent: d.uptime_global ?? d.uptime_global_percent ?? 100,
      latencia_p95_ms: d.latency_p95_ms ?? d.latencia_p95_ms ?? null,
      errores_24h: d.errors_24h ?? d.errores_24h ?? 0,
      warnings_24h: d.warnings_24h ?? 0,
      tenants_with_errors: d.tenants_with_errors ?? 0,
      active_alerts: d.active_alerts ?? 0,
      errors_by_tenant: d.errors_by_tenant ?? [],
    };
  },
  async getAlertas(): Promise<Alerta[]> {
    const res = await axiosInstance.get(endpoints.admin.telemetry.alerts);
    return res.data.data;
  },
  async toggleAlerta(uid: string): Promise<Alerta> {
    const res = await axiosInstance.post(endpoints.admin.telemetry.toggleAlert(uid));
    return res.data.data;
  },
  async saveAlerta(data: AlertaPayload): Promise<Alerta> {
    const res = await axiosInstance.post(endpoints.admin.telemetry.alerts, data);
    return res.data.data;
  },
  async updateAlerta(uid: string, data: Partial<Alerta>): Promise<Alerta> {
    const res = await axiosInstance.put(endpoints.admin.telemetry.alert(uid), data);
    return res.data.data;
  },
};

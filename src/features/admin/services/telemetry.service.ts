import type {
  Alerta,
  AlertaPayload,
  LogEntry,
  TelemetryStats,
} from 'src/features/admin/types/admin.types';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { type PaginationParams } from 'src/shared/lib/pagination';

export const telemetryService = {
  async getLogs(params?: PaginationParams): Promise<LogEntry[]> {
    const res = await axiosInstance.get(endpoints.admin.telemetry.logs, { params });
    return res.data; // full response — callers extract .data for the array
  },
  async getStats(): Promise<TelemetryStats> {
    const res = await axiosInstance.get(endpoints.admin.telemetry.stats);
    return res.data.data;
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

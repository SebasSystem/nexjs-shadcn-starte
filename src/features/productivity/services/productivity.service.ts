import axiosInstance, { endpoints } from 'src/lib/axios';
import { type PaginationParams } from 'src/shared/lib/pagination';

import type {
  Activity,
  ActivityPayload,
  ActivityStatus,
  Document,
  Interaction,
  InteractionPayload,
} from '../types/productivity.types';

export interface ActivityUpdatePayload {
  title?: string;
  description?: string;
  type?: Activity['type'];
  status?: Activity['status'];
  due_date?: string;
  assigned_to_name?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const productivityService = {
  // ─── Activities ─────────────────────────────────────────────────────────

  listActivities: async (contactUid?: string, params?: PaginationParams): Promise<Activity[]> => {
    const url = endpoints.productivity.activities.list;
    const res = await axiosInstance.get(url, {
      params: { ...(contactUid ? { contact_uid: contactUid } : {}), ...params },
    });
    return res.data; // full response — callers extract .data for the array
  },

  getActivity: async (uid: string): Promise<Activity> => {
    const res = await axiosInstance.get(endpoints.productivity.activities.detail(uid));
    return (res.data?.data ?? res.data) as Activity;
  },

  createActivity: async (payload: ActivityPayload): Promise<Activity> => {
    const res = await axiosInstance.post(endpoints.productivity.activities.create, payload);
    return (res.data?.data ?? res.data) as Activity;
  },

  updateActivity: async (uid: string, payload: ActivityUpdatePayload): Promise<Activity> => {
    const res = await axiosInstance.put(endpoints.productivity.activities.update(uid), payload);
    return (res.data?.data ?? res.data) as Activity;
  },

  deleteActivity: async (uid: string): Promise<void> => {
    await axiosInstance.delete(endpoints.productivity.activities.delete(uid));
  },

  updateActivityStatus: async (uid: string, status: ActivityStatus): Promise<Activity> => {
    const res = await axiosInstance.patch(endpoints.productivity.activities.update(uid), {
      status,
    });
    return (res.data?.data ?? res.data) as Activity;
  },

  listActivitiesByRange: async (start: string, end: string): Promise<Activity[]> => {
    const res = await axiosInstance.get(endpoints.productivity.activities.range, {
      params: { start, end },
    });
    return (res.data?.data ?? res.data ?? []) as Activity[];
  },

  // ─── Interactions ──────────────────────────────────────────────────────

  listInteractions: async (
    contactUid: string,
    params?: PaginationParams
  ): Promise<Interaction[]> => {
    const res = await axiosInstance.get(endpoints.productivity.interactions.list(contactUid), {
      params,
    });
    return res.data; // full response — callers extract .data for the array
  },

  getTimeline: async (): Promise<Interaction[]> => {
    const res = await axiosInstance.get(endpoints.productivity.interactions.timeline);
    return (res.data?.data ?? res.data ?? []) as Interaction[];
  },

  createInteraction: async (
    contactUid: string,
    payload: InteractionPayload
  ): Promise<Interaction> => {
    const res = await axiosInstance.post(
      endpoints.productivity.interactions.list(contactUid),
      payload
    );
    return (res.data?.data ?? res.data) as Interaction;
  },

  createNote: async (
    payload: InteractionPayload & { contact_uid?: string }
  ): Promise<Interaction> => {
    const res = await axiosInstance.post(endpoints.productivity.interactions.notes, payload);
    return (res.data?.data ?? res.data) as Interaction;
  },

  createCall: async (
    payload: InteractionPayload & { contact_uid?: string }
  ): Promise<Interaction> => {
    const res = await axiosInstance.post(endpoints.productivity.interactions.calls, payload);
    return (res.data?.data ?? res.data) as Interaction;
  },

  createEmail: async (
    payload: InteractionPayload & { contact_uid?: string }
  ): Promise<Interaction> => {
    const res = await axiosInstance.post(endpoints.productivity.interactions.emails, payload);
    return (res.data?.data ?? res.data) as Interaction;
  },

  // ─── Documents / Vault ─────────────────────────────────────────────────

  listDocuments: async (entityType: string, entityUid: string): Promise<Document[]> => {
    const res = await axiosInstance.get(
      endpoints.productivity.documents.list(entityType, entityUid)
    );
    return (res.data?.data ?? res.data ?? []) as Document[];
  },

  uploadDocument: async (entityType: string, entityUid: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosInstance.post(
      endpoints.productivity.documents.upload(entityType, entityUid),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return (res.data?.data ?? res.data) as Document;
  },

  deleteDocument: async (entityType: string, entityUid: string, docUid: string): Promise<void> => {
    await axiosInstance.delete(
      endpoints.productivity.documents.delete(entityType, entityUid, docUid)
    );
  },
};

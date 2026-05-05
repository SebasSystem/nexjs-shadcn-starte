import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  Activity,
  ActivityPayload,
  ActivityStatus,
  Document,
  Interaction,
  InteractionPayload,
} from '../types/productivity.types';

// ─────────────────────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────────────────────

function mapActivity(raw: Record<string, unknown>): Activity {
  return {
    uid: raw.uid as string,
    contact_uid: raw.contact_uid as string | undefined,
    contact_name: raw.contact_name as string | undefined,
    type: (raw.type as Activity['type']) ?? 'TASK',
    title: raw.title as string,
    description: raw.description as string | undefined,
    status: (raw.status as Activity['status']) ?? 'PENDING',
    due_date: raw.due_date as string,
    assigned_to_uid: raw.assigned_to_uid as string | undefined,
    assigned_to_name: (raw.assigned_to_name as string) ?? '',
    source: raw.source as Activity['source'] | undefined,
    source_uid: raw.source_uid as string | undefined,
    source_path: raw.source_path as string | undefined,
    source_label: raw.source_label as string | undefined,
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

function mapInteraction(raw: Record<string, unknown>): Interaction {
  return {
    uid: raw.uid as string,
    contact_uid: raw.contact_uid as string,
    type: (raw.type as Interaction['type']) ?? 'NOTE',
    content: raw.content as string,
    author: raw.author as string,
    created_at: raw.created_at as string,
  };
}

function mapDocument(raw: Record<string, unknown>): Document {
  return {
    uid: raw.uid as string,
    contact_uid: raw.contact_uid as string,
    file_name: raw.file_name as string,
    url: raw.url as string,
    size_bytes: raw.size_bytes as number,
    mime_type: raw.mime_type as string,
    uploaded_by: raw.uploaded_by as string,
    uploaded_at: raw.uploaded_at as string,
  };
}

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

  listActivities: async (contactUid?: string): Promise<Activity[]> => {
    const url = endpoints.productivity.activities.list;
    const res = await axiosInstance.get(url, {
      params: contactUid ? { contact_uid: contactUid } : undefined,
    });
    const data = res.data?.data ?? res.data ?? [];
    return (data as Record<string, unknown>[]).map(mapActivity);
  },

  getActivity: async (uid: string): Promise<Activity> => {
    const res = await axiosInstance.get(endpoints.productivity.activities.detail(uid));
    const data = res.data?.data ?? res.data;
    return mapActivity(data as Record<string, unknown>);
  },

  createActivity: async (payload: ActivityPayload): Promise<Activity> => {
    const res = await axiosInstance.post(endpoints.productivity.activities.create, payload);
    const data = res.data?.data ?? res.data;
    return mapActivity(data as Record<string, unknown>);
  },

  updateActivity: async (uid: string, payload: ActivityUpdatePayload): Promise<Activity> => {
    const res = await axiosInstance.put(endpoints.productivity.activities.update(uid), payload);
    const data = res.data?.data ?? res.data;
    return mapActivity(data as Record<string, unknown>);
  },

  deleteActivity: async (uid: string): Promise<void> => {
    await axiosInstance.delete(endpoints.productivity.activities.delete(uid));
  },

  updateActivityStatus: async (uid: string, status: ActivityStatus): Promise<Activity> => {
    const res = await axiosInstance.patch(endpoints.productivity.activities.update(uid), {
      status,
    });
    const data = res.data?.data ?? res.data;
    return mapActivity(data as Record<string, unknown>);
  },

  listActivitiesByRange: async (start: string, end: string): Promise<Activity[]> => {
    const res = await axiosInstance.get(endpoints.productivity.activities.range, {
      params: { start, end },
    });
    const data = res.data?.data ?? res.data ?? [];
    return (data as Record<string, unknown>[]).map(mapActivity);
  },

  // ─── Interactions ──────────────────────────────────────────────────────

  listInteractions: async (contactUid: string): Promise<Interaction[]> => {
    const res = await axiosInstance.get(endpoints.productivity.interactions.list(contactUid));
    const data = res.data?.data ?? res.data ?? [];
    return (data as Record<string, unknown>[]).map(mapInteraction);
  },

  getTimeline: async (): Promise<Interaction[]> => {
    const res = await axiosInstance.get(endpoints.productivity.interactions.timeline);
    const data = res.data?.data ?? res.data ?? [];
    return (data as Record<string, unknown>[]).map(mapInteraction);
  },

  createInteraction: async (
    contactUid: string,
    payload: InteractionPayload
  ): Promise<Interaction> => {
    const res = await axiosInstance.post(
      endpoints.productivity.interactions.list(contactUid),
      payload
    );
    const data = res.data?.data ?? res.data;
    return mapInteraction(data as Record<string, unknown>);
  },

  createNote: async (
    payload: InteractionPayload & { contact_uid?: string }
  ): Promise<Interaction> => {
    const res = await axiosInstance.post(endpoints.productivity.interactions.notes, payload);
    const data = res.data?.data ?? res.data;
    return mapInteraction(data as Record<string, unknown>);
  },

  createCall: async (
    payload: InteractionPayload & { contact_uid?: string }
  ): Promise<Interaction> => {
    const res = await axiosInstance.post(endpoints.productivity.interactions.calls, payload);
    const data = res.data?.data ?? res.data;
    return mapInteraction(data as Record<string, unknown>);
  },

  createEmail: async (
    payload: InteractionPayload & { contact_uid?: string }
  ): Promise<Interaction> => {
    const res = await axiosInstance.post(endpoints.productivity.interactions.emails, payload);
    const data = res.data?.data ?? res.data;
    return mapInteraction(data as Record<string, unknown>);
  },

  // ─── Documents / Vault ─────────────────────────────────────────────────

  listDocuments: async (entityType: string, entityUid: string): Promise<Document[]> => {
    const res = await axiosInstance.get(
      endpoints.productivity.documents.list(entityType, entityUid)
    );
    const data = res.data?.data ?? res.data ?? [];
    return (data as Record<string, unknown>[]).map(mapDocument);
  },

  uploadDocument: async (entityType: string, entityUid: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosInstance.post(
      endpoints.productivity.documents.upload(entityType, entityUid),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    const data = res.data?.data ?? res.data;
    return mapDocument(data as Record<string, unknown>);
  },

  deleteDocument: async (entityType: string, entityUid: string, docUid: string): Promise<void> => {
    await axiosInstance.delete(
      endpoints.productivity.documents.delete(entityType, entityUid, docUid)
    );
  },
};

import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Segment, SegmentPayload } from '../types/segments.types';

// ─────────────────────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────────────────────

function mapSegment(raw: Record<string, unknown>): Segment {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    description: (raw.description as string) ?? '',
    logic: (raw.logic as 'AND' | 'OR') ?? 'AND',
    rules: (raw.rules as Segment['rules']) ?? [],
    total_contacts: (raw.total_contacts as number) ?? 0,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const segmentsService = {
  /** Fetches all segments from /segments */
  list: async (): Promise<Segment[]> => {
    const res = await axiosInstance.get(endpoints.contacts.segments.list);
    const data = res.data?.data ?? res.data ?? [];
    return (data as Record<string, unknown>[]).map(mapSegment);
  },

  /** Fetches a single segment by uid */
  getById: async (uid: string): Promise<Segment | undefined> => {
    try {
      const res = await axiosInstance.get(endpoints.contacts.segments.detail(uid));
      const data = res.data?.data ?? res.data;
      return mapSegment(data as Record<string, unknown>);
    } catch {
      return undefined;
    }
  },

  /** Creates a new segment */
  create: async (payload: SegmentPayload): Promise<Segment> => {
    const res = await axiosInstance.post(endpoints.contacts.segments.create, payload);
    const data = res.data?.data ?? res.data;
    return mapSegment(data as Record<string, unknown>);
  },

  /** Updates an existing segment */
  update: async (uid: string, payload: Partial<SegmentPayload>): Promise<Segment> => {
    const res = await axiosInstance.put(endpoints.contacts.segments.update(uid), payload);
    const data = res.data?.data ?? res.data;
    return mapSegment(data as Record<string, unknown>);
  },

  /** Deletes a segment by uid */
  remove: async (uid: string): Promise<void> => {
    await axiosInstance.delete(endpoints.contacts.segments.delete(uid));
  },
};

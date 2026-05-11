import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

import type { Segment, SegmentPayload } from '../types/segments.types';

export const segmentsService = {
  /** Fetches all segments from /segments */
  list: async (params?: PaginationParams): Promise<unknown> => {
    const res = await axiosInstance.get(endpoints.contacts.segments.list, { params });
    return res.data;
  },

  /** Fetches a single segment by uid — lets errors propagate (hook handles onError) */
  getById: async (uid: string): Promise<Segment> => {
    const res = await axiosInstance.get(endpoints.contacts.segments.detail(uid));
    return (res.data?.data ?? res.data) as Segment;
  },

  /** Creates a new segment */
  create: async (payload: SegmentPayload): Promise<Segment> => {
    const res = await axiosInstance.post(endpoints.contacts.segments.create, payload);
    return (res.data?.data ?? res.data) as Segment;
  },

  /** Updates an existing segment */
  update: async (uid: string, payload: Partial<SegmentPayload>): Promise<Segment> => {
    const res = await axiosInstance.put(endpoints.contacts.segments.update(uid), payload);
    return (res.data?.data ?? res.data) as Segment;
  },

  /** Deletes a segment by uid */
  remove: async (uid: string): Promise<void> => {
    await axiosInstance.delete(endpoints.contacts.segments.delete(uid));
  },
};

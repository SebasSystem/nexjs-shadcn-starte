import axiosInstance, { endpoints } from 'src/lib/axios';
import type { PaginationParams } from 'src/shared/lib/pagination';

import type {
  Partner,
  PartnerOpportunity,
  PartnerOpportunityPayload,
  PartnerPayload,
  PortalMaterial,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const partnersService = {
  // ── Partners ────────────────────────────────────────────────────────────

  partners: {
    list: async (params?: PaginationParams): Promise<unknown> => {
      const res = await axiosInstance.get(endpoints.partners.partners.list, { params });
      return res.data;
    },

    getById: async (uid: string): Promise<Partner | undefined> => {
      try {
        const res = await axiosInstance.get(endpoints.partners.partners.detail(uid));
        return (res.data?.data ?? res.data) as Partner;
      } catch {
        return undefined;
      }
    },

    create: async (payload: PartnerPayload): Promise<Partner> => {
      const res = await axiosInstance.post(endpoints.partners.partners.create, payload);
      return (res.data?.data ?? res.data) as Partner;
    },

    update: async (uid: string, payload: Partial<PartnerPayload>): Promise<Partner> => {
      const res = await axiosInstance.put(endpoints.partners.partners.update(uid), payload);
      return (res.data?.data ?? res.data) as Partner;
    },

    remove: async (uid: string): Promise<void> => {
      await axiosInstance.delete(endpoints.partners.partners.delete(uid));
    },
  },

  // ── Opportunities ───────────────────────────────────────────────────────

  opportunities: {
    list: async (
      params?: PaginationParams & { status?: string; partner_uid?: string; search?: string }
    ): Promise<PartnerOpportunity[]> => {
      const res = await axiosInstance.get(endpoints.partners.opportunities.list, { params });
      return (res.data?.data ?? res.data ?? []) as PartnerOpportunity[];
    },

    getById: async (uid: string): Promise<PartnerOpportunity | undefined> => {
      try {
        const res = await axiosInstance.get(endpoints.partners.opportunities.detail(uid));
        return (res.data?.data ?? res.data) as PartnerOpportunity;
      } catch {
        return undefined;
      }
    },

    create: async (payload: PartnerOpportunityPayload): Promise<PartnerOpportunity> => {
      const res = await axiosInstance.post(endpoints.partners.opportunities.create, payload);
      return (res.data?.data ?? res.data) as PartnerOpportunity;
    },

    update: async (
      uid: string,
      payload: Partial<PartnerOpportunityPayload>
    ): Promise<PartnerOpportunity> => {
      const res = await axiosInstance.put(endpoints.partners.opportunities.update(uid), payload);
      return (res.data?.data ?? res.data) as PartnerOpportunity;
    },

    remove: async (uid: string): Promise<void> => {
      await axiosInstance.delete(endpoints.partners.opportunities.delete(uid));
    },

    approve: async (uid: string): Promise<PartnerOpportunity> => {
      const res = await axiosInstance.post(endpoints.partners.opportunities.approve(uid));
      return (res.data?.data ?? res.data) as PartnerOpportunity;
    },

    reject: async (uid: string): Promise<PartnerOpportunity> => {
      const res = await axiosInstance.post(endpoints.partners.opportunities.reject(uid));
      return (res.data?.data ?? res.data) as PartnerOpportunity;
    },

    convert: async (uid: string): Promise<PartnerOpportunity> => {
      const res = await axiosInstance.post(endpoints.partners.opportunities.convert(uid));
      return (res.data?.data ?? res.data) as PartnerOpportunity;
    },
  },

  // ── Materials ───────────────────────────────────────────────────────────

  materials: {
    list: async (params?: PaginationParams): Promise<PortalMaterial[]> => {
      const res = await axiosInstance.get(endpoints.partners.materials.list, { params });
      return (res.data?.data ?? res.data ?? []) as PortalMaterial[];
    },

    getById: async (uid: string): Promise<PortalMaterial | undefined> => {
      try {
        const res = await axiosInstance.get(endpoints.partners.materials.detail(uid));
        return (res.data?.data ?? res.data) as PortalMaterial;
      } catch {
        return undefined;
      }
    },

    create: async (payload: FormData): Promise<PortalMaterial> => {
      const res = await axiosInstance.post(endpoints.partners.materials.create, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return (res.data?.data ?? res.data) as PortalMaterial;
    },

    remove: async (uid: string): Promise<void> => {
      await axiosInstance.delete(endpoints.partners.materials.delete(uid));
    },
  },
};

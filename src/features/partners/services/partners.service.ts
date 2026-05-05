import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  Partner,
  PartnerOpportunity,
  PartnerOpportunityPayload,
  PartnerPayload,
  PortalMaterial,
  PortalMaterialPayload,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mappers — converts snake_case backend responses to typed entities
// ─────────────────────────────────────────────────────────────────────────────

function mapPartner(raw: Record<string, unknown>): Partner {
  return {
    uid: raw.uid as string,
    name: raw.name as string,
    type: raw.type as Partner['type'],
    status: raw.status as Partner['status'],
    contact_name: raw.contact_name as string,
    contact_email: raw.contact_email as string,
    phone: raw.phone as string | undefined,
    region: raw.region as string,
    registered_opportunities: (raw.registered_opportunities as number) ?? 0,
    converted_deals: (raw.converted_deals as number) ?? 0,
    joined_date: raw.joined_date as string,
    notes: raw.notes as string | undefined,
  };
}

function mapOpportunity(raw: Record<string, unknown>): PartnerOpportunity {
  return {
    uid: raw.uid as string,
    partner_uid: raw.partner_uid as string,
    partner_name: raw.partner_name as string,
    client_name: raw.client_name as string,
    client_email: raw.client_email as string | undefined,
    product: raw.product as string,
    estimated_value: (raw.estimated_value as number) ?? 0,
    currency: raw.currency as PartnerOpportunity['currency'],
    status: raw.status as PartnerOpportunity['status'],
    registered_date: raw.registered_date as string,
    notes: raw.notes as string | undefined,
    assigned_to_internal: raw.assigned_to_internal as string | undefined,
  };
}

function mapMaterial(raw: Record<string, unknown>): PortalMaterial {
  return {
    uid: raw.uid as string,
    title: raw.title as string,
    description: raw.description as string,
    type: raw.type as PortalMaterial['type'],
    file_name: raw.file_name as string,
    file_size: raw.file_size as string,
    uploaded_at: raw.uploaded_at as string,
    uploaded_by: raw.uploaded_by as string,
    tags: (raw.tags as string[]) ?? [],
    download_count: (raw.download_count as number) ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const partnersService = {
  // ── Partners ────────────────────────────────────────────────────────────

  partners: {
    list: async (): Promise<Partner[]> => {
      const res = await axiosInstance.get(endpoints.partners.partners.list);
      const data: Record<string, unknown>[] = res.data?.data ?? res.data ?? [];
      return data.map(mapPartner);
    },

    getById: async (uid: string): Promise<Partner | undefined> => {
      try {
        const res = await axiosInstance.get(endpoints.partners.partners.detail(uid));
        const data = res.data?.data ?? res.data;
        return mapPartner(data);
      } catch {
        return undefined;
      }
    },

    create: async (payload: PartnerPayload): Promise<Partner> => {
      const res = await axiosInstance.post(endpoints.partners.partners.create, payload);
      const data = res.data?.data ?? res.data;
      return mapPartner(data);
    },

    update: async (uid: string, payload: Partial<PartnerPayload>): Promise<Partner> => {
      const res = await axiosInstance.put(endpoints.partners.partners.update(uid), payload);
      const data = res.data?.data ?? res.data;
      return mapPartner(data);
    },

    remove: async (uid: string): Promise<void> => {
      await axiosInstance.delete(endpoints.partners.partners.delete(uid));
    },
  },

  // ── Opportunities ───────────────────────────────────────────────────────

  opportunities: {
    list: async (): Promise<PartnerOpportunity[]> => {
      const res = await axiosInstance.get(endpoints.partners.opportunities.list);
      const data: Record<string, unknown>[] = res.data?.data ?? res.data ?? [];
      return data.map(mapOpportunity);
    },

    getById: async (uid: string): Promise<PartnerOpportunity | undefined> => {
      try {
        const res = await axiosInstance.get(endpoints.partners.opportunities.detail(uid));
        const data = res.data?.data ?? res.data;
        return mapOpportunity(data);
      } catch {
        return undefined;
      }
    },

    create: async (payload: PartnerOpportunityPayload): Promise<PartnerOpportunity> => {
      const res = await axiosInstance.post(endpoints.partners.opportunities.create, payload);
      const data = res.data?.data ?? res.data;
      return mapOpportunity(data);
    },

    update: async (
      uid: string,
      payload: Partial<PartnerOpportunityPayload>
    ): Promise<PartnerOpportunity> => {
      const res = await axiosInstance.put(endpoints.partners.opportunities.update(uid), payload);
      const data = res.data?.data ?? res.data;
      return mapOpportunity(data);
    },

    remove: async (uid: string): Promise<void> => {
      await axiosInstance.delete(endpoints.partners.opportunities.delete(uid));
    },

    validate: async (uids: string[]): Promise<void> => {
      await axiosInstance.post(endpoints.partners.opportunities.validate, { uids });
    },

    close: async (uid: string): Promise<PartnerOpportunity> => {
      const res = await axiosInstance.post(endpoints.partners.opportunities.close(uid));
      const data = res.data?.data ?? res.data;
      return mapOpportunity(data);
    },
  },

  // ── Materials ───────────────────────────────────────────────────────────

  materials: {
    list: async (): Promise<PortalMaterial[]> => {
      const res = await axiosInstance.get(endpoints.partners.materials.list);
      const data: Record<string, unknown>[] = res.data?.data ?? res.data ?? [];
      return data.map(mapMaterial);
    },

    getById: async (uid: string): Promise<PortalMaterial | undefined> => {
      try {
        const res = await axiosInstance.get(endpoints.partners.materials.detail(uid));
        const data = res.data?.data ?? res.data;
        return mapMaterial(data);
      } catch {
        return undefined;
      }
    },

    create: async (payload: PortalMaterialPayload): Promise<PortalMaterial> => {
      const res = await axiosInstance.post(endpoints.partners.materials.create, payload);
      const data = res.data?.data ?? res.data;
      return mapMaterial(data);
    },

    remove: async (uid: string): Promise<void> => {
      await axiosInstance.delete(endpoints.partners.materials.delete(uid));
    },
  },
};

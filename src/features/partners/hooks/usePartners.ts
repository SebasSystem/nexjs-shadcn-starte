'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from 'src/lib/query-keys';

import { partnersService } from '../services/partners.service';
import type { PartnerOpportunityPayload, PartnerPayload, PortalMaterialPayload } from '../types';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePartners() {
  const queryClient = useQueryClient();

  // ── Queries ─────────────────────────────────────────────────────────────

  const { data: partners = [], isLoading: loadingPartners } = useQuery({
    queryKey: queryKeys.partners.partners.list,
    queryFn: () => partnersService.partners.list(),
  });

  const { data: opportunities = [], isLoading: loadingOpportunities } = useQuery({
    queryKey: queryKeys.partners.opportunities.list,
    queryFn: () => partnersService.opportunities.list(),
  });

  const { data: materials = [], isLoading: loadingMaterials } = useQuery({
    queryKey: queryKeys.partners.materials.list,
    queryFn: () => partnersService.materials.list(),
  });

  // ── Stats (computed client-side) ────────────────────────────────────────

  const partnerStats = useMemo(() => {
    const active = partners.filter((p) => p.status === 'active').length;
    const prospects = partners.filter((p) => p.status === 'prospect').length;
    const pendingOpps = opportunities.filter((o) => o.status === 'pending').length;
    const convertedDeals = partners.reduce((acc, p) => acc + p.converted_deals, 0);
    return { active, prospects, pendingOpps, convertedDeals };
  }, [partners, opportunities]);

  const opportunityStats = useMemo(() => {
    const pending = opportunities.filter((o) => o.status === 'pending').length;
    const approved = opportunities.filter((o) => o.status === 'approved').length;
    const rejected = opportunities.filter((o) => o.status === 'rejected').length;
    const converted = opportunities.filter((o) => o.status === 'converted').length;
    return { pending, approved, rejected, converted };
  }, [opportunities]);

  const materialStats = useMemo(() => {
    const total = materials.length;
    const totalDownloads = materials.reduce((acc, m) => acc + m.download_count, 0);
    const lastUpdated =
      materials.length > 0
        ? materials.reduce((latest, m) => (m.uploaded_at > latest.uploaded_at ? m : latest))
            .uploaded_at
        : '—';
    return { total, totalDownloads, lastUpdated };
  }, [materials]);

  // ── Partners mutations ──────────────────────────────────────────────────

  const createPartner = async (data: PartnerPayload): Promise<boolean> => {
    try {
      await partnersService.partners.create(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      return true;
    } catch {
      return false;
    }
  };

  const updatePartner = async (uid: string, data: Partial<PartnerPayload>): Promise<boolean> => {
    try {
      await partnersService.partners.update(uid, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      return true;
    } catch {
      return false;
    }
  };

  const removePartner = async (uid: string): Promise<boolean> => {
    try {
      await partnersService.partners.remove(uid);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      return true;
    } catch {
      return false;
    }
  };

  // ── Opportunities mutations ─────────────────────────────────────────────

  const createOpportunity = async (data: PartnerOpportunityPayload): Promise<boolean> => {
    try {
      await partnersService.opportunities.create(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      return true;
    } catch {
      return false;
    }
  };

  const updateOpportunity = async (
    uid: string,
    data: Partial<PartnerOpportunityPayload>
  ): Promise<boolean> => {
    try {
      await partnersService.opportunities.update(uid, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      return true;
    } catch {
      return false;
    }
  };

  const validateOpportunity = async (uids: string[]): Promise<boolean> => {
    try {
      await partnersService.opportunities.validate(uids);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      return true;
    } catch {
      return false;
    }
  };

  const closeOpportunity = async (uid: string): Promise<boolean> => {
    try {
      await partnersService.opportunities.close(uid);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      return true;
    } catch {
      return false;
    }
  };

  const removeOpportunity = async (uid: string): Promise<boolean> => {
    try {
      await partnersService.opportunities.remove(uid);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      return true;
    } catch {
      return false;
    }
  };

  // ── Materials mutations ─────────────────────────────────────────────────

  const createMaterial = async (data: PortalMaterialPayload): Promise<boolean> => {
    try {
      await partnersService.materials.create(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.materials.list });
      return true;
    } catch {
      return false;
    }
  };

  const removeMaterial = async (uid: string): Promise<boolean> => {
    try {
      await partnersService.materials.remove(uid);
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.materials.list });
      return true;
    } catch {
      return false;
    }
  };

  // ── Return ──────────────────────────────────────────────────────────────

  return {
    partners,
    opportunities,
    materials,
    loadingPartners,
    loadingOpportunities,
    loadingMaterials,
    partnerStats,
    opportunityStats,
    materialStats,
    createPartner,
    updatePartner,
    removePartner,
    createOpportunity,
    updateOpportunity,
    validateOpportunity,
    closeOpportunity,
    removeOpportunity,
    createMaterial,
    removeMaterial,
  };
}

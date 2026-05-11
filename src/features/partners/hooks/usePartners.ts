'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { partnersService } from '../services/partners.service';
import type {
  Partner,
  PartnerOpportunity,
  PartnerOpportunityPayload,
  PartnerPayload,
  PortalMaterial,
  PortalMaterialPayload,
} from '../types';

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface PartnersFilters {
  partnerType?: string;
  partnerStatus?: string;
  oppStatus?: string;
  oppPartnerUid?: string;
}

export function usePartners(filters: PartnersFilters = {}) {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();
  const oppPagination = usePaginationParams();
  const materialPagination = usePaginationParams();

  // ── Partner server-side filters merged with pagination ─────────────────
  const partnerServerParams = {
    ...pagination.params,
    ...(filters.partnerType ? { type: filters.partnerType } : {}),
    ...(filters.partnerStatus ? { status: filters.partnerStatus } : {}),
  };

  // ── Queries ─────────────────────────────────────────────────────────────

  const { data: partners = [], isLoading: loadingPartners } = useQuery({
    queryKey: [...queryKeys.partners.partners.list, partnerServerParams],
    queryFn: async () => {
      const res = await partnersService.partners.list(partnerServerParams);
      const meta = extractPaginationMeta(res as Record<string, unknown>);
      if (meta) pagination.setTotal(meta.total);
      return ((res as Record<string, unknown>).data ?? []) as Partner[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  // Opportunity server-side filters with separate pagination
  const oppServerParams = {
    ...oppPagination.params,
    ...(filters.oppStatus ? { status: filters.oppStatus } : {}),
    ...(filters.oppPartnerUid ? { partner_uid: filters.oppPartnerUid } : {}),
  };

  const { data: opportunities = [], isLoading: loadingOpportunities } = useQuery({
    queryKey: [...queryKeys.partners.opportunities.list, oppServerParams],
    queryFn: async () => {
      const res = await partnersService.opportunities.list(
        Object.keys(oppServerParams).length > 0 ? oppServerParams : undefined
      );
      const meta = extractPaginationMeta(res as unknown as Record<string, unknown>);
      if (meta) oppPagination.setTotal(meta.total);
      return res as unknown as PartnerOpportunity[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  const { data: materials = [], isLoading: loadingMaterials } = useQuery({
    queryKey: [...queryKeys.partners.materials.list, materialPagination.params],
    queryFn: async () => {
      const res = await partnersService.materials.list(materialPagination.params);
      const meta = extractPaginationMeta(res as unknown as Record<string, unknown>);
      if (meta) materialPagination.setTotal(meta.total);
      return ((res as unknown as Record<string, unknown>).data ?? []) as PortalMaterial[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  // ── Stats (computed client-side) ────────────────────────────────────────
  // TODO: Backend soporta ?with=stats en PartnerService::getPartners() que
  // devuelve { partners, stats, pagination }. Requiere query separado y
  // adaptar response format para no duplicar fetching de partners.

  const partnerStats = useMemo(() => {
    const active = partners.filter((p) => p.status === 'active').length;
    const prospects = partners.filter((p) => p.status === 'prospect').length;
    const pendingOpps = opportunities.filter((o) => o.status === 'pending').length;
    const convertedDeals = partners.reduce((acc, p) => acc + p.converted_deals, 0);
    return { active, prospects, pendingOpps, convertedDeals };
  }, [partners, opportunities]);

  const opportunityStats = useMemo(() => {
    // TODO: Backend no tiene endpoint de stats para oportunidades.
    // PartnerOpportunityService::opportunities() acepta filtros pero no endpoint /stats.
    const pending = opportunities.filter((o) => o.status === 'pending').length;
    const approved = opportunities.filter((o) => o.status === 'approved').length;
    const rejected = opportunities.filter((o) => o.status === 'rejected').length;
    const converted = opportunities.filter((o) => o.status === 'converted').length;
    return { pending, approved, rejected, converted };
  }, [opportunities]);

  const materialStats = useMemo(() => {
    // TODO: Backend PartnerResourceService no tiene endpoint de stats.
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

  const createPartnerMutation = useMutation({
    mutationFn: (data: PartnerPayload) => partnersService.partners.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Partner creado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updatePartnerMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<PartnerPayload> }) =>
      partnersService.partners.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Partner actualizado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const removePartnerMutation = useMutation({
    mutationFn: (uid: string) => partnersService.partners.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Partner eliminado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const createPartner = async (data: PartnerPayload): Promise<boolean> => {
    await createPartnerMutation.mutateAsync(data);
    return true;
  };

  const updatePartner = async (uid: string, data: Partial<PartnerPayload>): Promise<boolean> => {
    await updatePartnerMutation.mutateAsync({ uid, data });
    return true;
  };

  const removePartner = async (uid: string): Promise<boolean> => {
    await removePartnerMutation.mutateAsync(uid);
    return true;
  };

  // ── Opportunities mutations ─────────────────────────────────────────────

  const createOpportunityMutation = useMutation({
    mutationFn: (data: PartnerOpportunityPayload) => partnersService.opportunities.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Oportunidad creada correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const updateOpportunityMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<PartnerOpportunityPayload> }) =>
      partnersService.opportunities.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Oportunidad actualizada correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const approveOpportunityMutation = useMutation({
    mutationFn: (uid: string) => partnersService.opportunities.approve(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Oportunidad aprobada correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const rejectOpportunityMutation = useMutation({
    mutationFn: (uid: string) => partnersService.opportunities.reject(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Oportunidad rechazada correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const convertOpportunityMutation = useMutation({
    mutationFn: (uid: string) => partnersService.opportunities.convert(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Oportunidad convertida correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const removeOpportunityMutation = useMutation({
    mutationFn: (uid: string) => partnersService.opportunities.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.opportunities.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.partners.list });
      toast.success('Oportunidad eliminada correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const createOpportunity = async (data: PartnerOpportunityPayload): Promise<boolean> => {
    await createOpportunityMutation.mutateAsync(data);
    return true;
  };

  const updateOpportunity = async (
    uid: string,
    data: Partial<PartnerOpportunityPayload>
  ): Promise<boolean> => {
    await updateOpportunityMutation.mutateAsync({ uid, data });
    return true;
  };

  const approveOpportunity = async (uid: string): Promise<boolean> => {
    await approveOpportunityMutation.mutateAsync(uid);
    return true;
  };

  const rejectOpportunity = async (uid: string): Promise<boolean> => {
    await rejectOpportunityMutation.mutateAsync(uid);
    return true;
  };

  const convertOpportunity = async (uid: string): Promise<boolean> => {
    await convertOpportunityMutation.mutateAsync(uid);
    return true;
  };

  const removeOpportunity = async (uid: string): Promise<boolean> => {
    await removeOpportunityMutation.mutateAsync(uid);
    return true;
  };

  // ── Materials mutations ─────────────────────────────────────────────────

  const createMaterialMutation = useMutation({
    mutationFn: (data: PortalMaterialPayload) => partnersService.materials.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.materials.list });
      toast.success('Material creado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const removeMaterialMutation = useMutation({
    mutationFn: (uid: string) => partnersService.materials.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.materials.list });
      toast.success('Material eliminado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const createMaterial = async (data: PortalMaterialPayload): Promise<boolean> => {
    await createMaterialMutation.mutateAsync(data);
    return true;
  };

  const removeMaterial = async (uid: string): Promise<boolean> => {
    await removeMaterialMutation.mutateAsync(uid);
    return true;
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
    approveOpportunity,
    rejectOpportunity,
    convertOpportunity,
    removeOpportunity,
    createMaterial,
    removeMaterial,
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      search: pagination.search,
      onChangeSearch: pagination.onChangeSearch,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
    oppPagination: {
      page: oppPagination.page,
      rowsPerPage: oppPagination.rowsPerPage,
      total: oppPagination.total,
      search: oppPagination.search,
      onChangeSearch: oppPagination.onChangeSearch,
      onChangePage: oppPagination.onChangePage,
      onChangeRowsPerPage: oppPagination.onChangeRowsPerPage,
    },
    materialPagination: {
      page: materialPagination.page,
      rowsPerPage: materialPagination.rowsPerPage,
      total: materialPagination.total,
      search: materialPagination.search,
      onChangeSearch: materialPagination.onChangeSearch,
      onChangePage: materialPagination.onChangePage,
      onChangeRowsPerPage: materialPagination.onChangeRowsPerPage,
    },
  };
}

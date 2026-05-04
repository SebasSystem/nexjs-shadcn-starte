import { useMemo, useState } from 'react';
import {
  MOCK_PARTNER_OPPORTUNITIES,
  MOCK_PARTNERS,
  MOCK_PORTAL_MATERIALS,
} from 'src/_mock/_partners';

import type { Partner, PartnerOpportunity, PortalMaterial } from '../types';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [opportunities, setOpportunities] = useState<PartnerOpportunity[]>(
    MOCK_PARTNER_OPPORTUNITIES
  );
  const [materials, setMaterials] = useState<PortalMaterial[]>(MOCK_PORTAL_MATERIALS);

  const partnerStats = useMemo(() => {
    const active = partners.filter((p) => p.status === 'active').length;
    const prospects = partners.filter((p) => p.status === 'prospect').length;
    const pendingOpps = opportunities.filter((o) => o.status === 'pending').length;
    const convertedDeals = partners.reduce((acc, p) => acc + p.convertedDeals, 0);
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
    const totalDownloads = materials.reduce((acc, m) => acc + m.downloadCount, 0);
    const lastUpdated =
      materials.length > 0
        ? materials.reduce((latest, m) => (m.uploadedAt > latest.uploadedAt ? m : latest))
            .uploadedAt
        : '—';
    return { total, totalDownloads, lastUpdated };
  }, [materials]);

  // ── Partners CRUD ────────────────────────────────────────────────────────────

  function createPartner(data: Omit<Partner, 'id' | 'registeredOpportunities' | 'convertedDeals'>) {
    const newPartner: Partner = {
      ...data,
      id: `partner-${Date.now()}`,
      registeredOpportunities: 0,
      convertedDeals: 0,
    };
    setPartners((prev) => [newPartner, ...prev]);
  }

  function updatePartner(id: string, changes: Partial<Partner>) {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  // ── Opportunities CRUD ───────────────────────────────────────────────────────

  function createOpportunity(data: Omit<PartnerOpportunity, 'id'>) {
    const newOpp: PartnerOpportunity = { ...data, id: `popp-${Date.now()}` };
    setOpportunities((prev) => [newOpp, ...prev]);
    setPartners((prev) =>
      prev.map((p) =>
        p.id === data.partnerId
          ? { ...p, registeredOpportunities: p.registeredOpportunities + 1 }
          : p
      )
    );
  }

  function updateOpportunity(id: string, changes: Partial<PartnerOpportunity>) {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, ...changes } : o)));
  }

  function approveOpportunity(id: string) {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'approved' } : o)));
  }

  function rejectOpportunity(id: string) {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'rejected' } : o)));
  }

  function convertOpportunity(id: string) {
    const opp = opportunities.find((o) => o.id === id);
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'converted' } : o)));
    if (opp) {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === opp.partnerId ? { ...p, convertedDeals: p.convertedDeals + 1 } : p
        )
      );
    }
  }

  // ── Materials ────────────────────────────────────────────────────────────────

  function createMaterial(data: Omit<PortalMaterial, 'id' | 'downloadCount'>) {
    const newMaterial: PortalMaterial = {
      ...data,
      id: `mat-${Date.now()}`,
      downloadCount: 0,
    };
    setMaterials((prev) => [newMaterial, ...prev]);
  }

  return {
    partners,
    opportunities,
    materials,
    partnerStats,
    opportunityStats,
    materialStats,
    createPartner,
    updatePartner,
    createOpportunity,
    updateOpportunity,
    approveOpportunity,
    rejectOpportunity,
    convertOpportunity,
    createMaterial,
  };
}

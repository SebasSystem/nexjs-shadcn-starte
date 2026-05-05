'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useContext } from 'react';
import { queryKeys } from 'src/lib/query-keys';

import { invoiceService } from '../services/invoice.service';
import { opportunityService } from '../services/opportunity.service';
import { quotationService } from '../services/quotation.service';
import type { Invoice, Opportunity, Payment, Quotation } from '../types/sales.types';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface SalesContextValue {
  opportunities: Opportunity[];
  quotations: Quotation[];
  invoices: Invoice[];
  isLoading: boolean;
  error: Error | null;

  addOpportunity: (data: Partial<Opportunity>) => Promise<Opportunity>;
  moveOpportunity: (uid: string, stageUid: string) => Promise<void>;

  saveQuotation: (data: Partial<Quotation>) => Promise<void>;
  convertQuotationToInvoice: (quotationUid: string) => Promise<Invoice>;

  registerPayment: (invoiceUid: string, data: Partial<Payment>) => Promise<void>;

  refreshOpportunities: () => Promise<void>;
  refreshQuotations: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SalesContext = createContext<SalesContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SalesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: opportunities = [],
    isLoading: oppsLoading,
    error: oppsError,
  } = useQuery({
    queryKey: queryKeys.sales.opportunityList,
    queryFn: () => opportunityService.getList(),
  });

  const { data: quotations = [], isLoading: quotesLoading } = useQuery({
    queryKey: queryKeys.sales.quotations,
    queryFn: () => quotationService.getList(),
  });

  const { data: invoices = [], isLoading: invsLoading } = useQuery({
    queryKey: queryKeys.sales.invoices,
    queryFn: () => invoiceService.getList(),
  });

  const isLoading = oppsLoading || quotesLoading || invsLoading;
  const error = (oppsError ?? null) as Error | null;

  // ─── Refresh helpers ────────────────────────────────────────────────────────

  const refreshOpportunities = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sales.opportunityList });
  }, [queryClient]);

  const refreshQuotations = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sales.quotations });
  }, [queryClient]);

  const refreshInvoices = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sales.invoices });
  }, [queryClient]);

  // ─── Opportunity mutations ──────────────────────────────────────────────────

  const addOpportunity = useCallback(
    async (data: Partial<Opportunity>): Promise<Opportunity> => {
      const created = await opportunityService.create(data);
      await refreshOpportunities();
      return created;
    },
    [refreshOpportunities]
  );

  const moveOpportunity = useCallback(
    async (uid: string, stageUid: string) => {
      await opportunityService.update(uid, { stage_uid: stageUid });
      await refreshOpportunities();
    },
    [refreshOpportunities]
  );

  // ─── Quotation mutations ────────────────────────────────────────────────────

  const saveQuotation = useCallback(
    async (data: Partial<Quotation>) => {
      if ((data as Quotation).uid) {
        await quotationService.update((data as Quotation).uid, data);
      } else {
        await quotationService.create(data);
      }
      await refreshQuotations();
    },
    [refreshQuotations]
  );

  const convertQuotationToInvoice = useCallback(
    async (quotationUid: string): Promise<Invoice> => {
      const created = (await invoiceService.create({
        quotation_uid: quotationUid,
      } as Partial<Invoice>)) as Invoice;
      await refreshInvoices();
      await refreshOpportunities();
      return created;
    },
    [refreshInvoices, refreshOpportunities]
  );

  // ─── Invoice mutations ──────────────────────────────────────────────────────

  const registerPayment = useCallback(
    async (invoiceUid: string, data: Partial<Payment>) => {
      await invoiceService.registerPayment(invoiceUid, data);
      await refreshInvoices();
    },
    [refreshInvoices]
  );

  return (
    <SalesContext.Provider
      value={{
        opportunities,
        quotations,
        invoices,
        isLoading,
        error,
        addOpportunity,
        moveOpportunity,
        saveQuotation,
        convertQuotationToInvoice,
        registerPayment,
        refreshOpportunities,
        refreshQuotations,
        refreshInvoices,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSalesContext(): SalesContextValue {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSalesContext must be used within SalesProvider');
  return ctx;
}

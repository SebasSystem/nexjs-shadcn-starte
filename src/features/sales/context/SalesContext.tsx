'use client';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useContext } from 'react';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

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

  quotationsPagination: {
    page: number;
    rowsPerPage: number;
    total: number;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (size: number) => void;
  };
  invoicesPagination: {
    page: number;
    rowsPerPage: number;
    total: number;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (size: number) => void;
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SalesContext = createContext<SalesContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SalesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const quotationsPagination = usePaginationParams();
  const invoicesPagination = usePaginationParams();

  const {
    data: opportunities = [],
    isLoading: oppsLoading,
    error: oppsError,
  } = useQuery({
    queryKey: queryKeys.sales.opportunityList,
    queryFn: async () => {
      const res = await opportunityService.getList();
      return (res as unknown as { data?: Opportunity[] }).data ?? [];
    },
    staleTime: 0,
  });

  const { data: quotations = [], isLoading: quotesLoading } = useQuery({
    queryKey: [...queryKeys.sales.quotations, quotationsPagination.params],
    queryFn: async () => {
      const res = await quotationService.getList(quotationsPagination.params);
      const meta = extractPaginationMeta(res as unknown as Record<string, unknown>);
      if (meta) quotationsPagination.setTotal(meta.total);
      return ((res as unknown as { data?: Quotation[] }).data ?? []) as Quotation[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  const { data: invoices = [], isLoading: invsLoading } = useQuery({
    queryKey: [...queryKeys.sales.invoices, invoicesPagination.params],
    queryFn: async () => {
      const res = await invoiceService.getList(invoicesPagination.params);
      const meta = extractPaginationMeta(res as unknown as Record<string, unknown>);
      if (meta) invoicesPagination.setTotal(meta.total);
      return ((res as unknown as { data?: Invoice[] }).data ?? []) as Invoice[];
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  const isLoading = oppsLoading || quotesLoading || invsLoading;
  const error = (oppsError ?? null) as Error | null;

  // ─── Refresh helpers ────────────────────────────────────────────────────────

  const refreshOpportunities = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sales.opportunityList });
    await queryClient.invalidateQueries({ queryKey: queryKeys.sales.board });
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
      try {
        const created = await opportunityService.create(data);
        await refreshOpportunities();
        return created;
      } catch (error) {
        toast.error(extractApiError(error));
        throw error;
      }
    },
    [refreshOpportunities]
  );

  const moveOpportunity = useCallback(
    async (uid: string, stageUid: string) => {
      try {
        await opportunityService.update(uid, { stage_uid: stageUid });
        await refreshOpportunities();
      } catch (error) {
        toast.error(extractApiError(error));
        throw error;
      }
    },
    [refreshOpportunities]
  );

  // ─── Quotation mutations ────────────────────────────────────────────────────

  const saveQuotation = useCallback(
    async (data: Partial<Quotation>) => {
      try {
        if ((data as Quotation).uid) {
          await quotationService.update((data as Quotation).uid, data);
        } else {
          await quotationService.create(data);
        }
        await refreshQuotations();
      } catch (error) {
        toast.error(extractApiError(error));
        throw error;
      }
    },
    [refreshQuotations]
  );

  const convertQuotationToInvoice = useCallback(
    async (quotationUid: string): Promise<Invoice> => {
      try {
        const created = (await invoiceService.create({
          quotation_uid: quotationUid,
        } as Partial<Invoice>)) as Invoice;
        await refreshInvoices();
        await refreshOpportunities();
        return created;
      } catch (error) {
        toast.error(extractApiError(error));
        throw error;
      }
    },
    [refreshInvoices, refreshOpportunities]
  );

  // ─── Invoice mutations ──────────────────────────────────────────────────────

  const registerPayment = useCallback(
    async (invoiceUid: string, data: Partial<Payment>) => {
      try {
        await invoiceService.registerPayment(invoiceUid, data);
        await refreshInvoices();
      } catch (error) {
        toast.error(extractApiError(error));
        throw error;
      }
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
        quotationsPagination: {
          page: quotationsPagination.page,
          rowsPerPage: quotationsPagination.rowsPerPage,
          total: quotationsPagination.total,
          onChangePage: quotationsPagination.onChangePage,
          onChangeRowsPerPage: quotationsPagination.onChangeRowsPerPage,
        },
        invoicesPagination: {
          page: invoicesPagination.page,
          rowsPerPage: invoicesPagination.rowsPerPage,
          total: invoicesPagination.total,
          onChangePage: invoicesPagination.onChangePage,
          onChangeRowsPerPage: invoicesPagination.onChangeRowsPerPage,
        },
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

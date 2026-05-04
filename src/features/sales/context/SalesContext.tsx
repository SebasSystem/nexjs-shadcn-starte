'use client';

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { MOCK_INVOICES, MOCK_OPPORTUNITIES, MOCK_QUOTATIONS } from 'src/_mock/_sales';
import type {
  Activity,
  Invoice,
  LostReasonInfo,
  Note,
  Opportunity,
  Payment,
  ProductLine,
  Quotation,
  StageId,
} from 'src/features/sales/types/sales.types';

import { STAGE_CHECKLIST_TEMPLATES } from '../config/pipeline.config';

// ─── Context Shape ────────────────────────────────────────────────────────────

type NewOpportunityData = Omit<
  Opportunity,
  'id' | 'createdAt' | 'stageEnteredAt' | 'stageHistory' | 'checklist' | 'lostReason'
>;

interface SalesContextValue {
  opportunities: Opportunity[];
  quotations: Quotation[];
  invoices: Invoice[];

  addOpportunity: (opp: NewOpportunityData) => Opportunity;
  moveOpportunity: (
    id: string,
    stage: StageId,
    payload?: { outcome?: 'ganado' | 'perdido'; lostReason?: LostReasonInfo }
  ) => void;
  toggleChecklistItem: (oppId: string, itemId: string) => void;
  addChecklistItem: (oppId: string, text: string) => void;
  removeChecklistItem: (oppId: string, itemId: string) => void;
  addActivityToOpportunity: (id: string, activity: Omit<Activity, 'id'>) => void;
  addNoteToOpportunity: (id: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNoteInOpportunity: (oppId: string, noteId: string, text: string) => void;
  removeNoteFromOpportunity: (oppId: string, noteId: string) => void;
  updateActivityInOpportunity: (oppId: string, activityId: string, data: Partial<Activity>) => void;
  removeActivityFromOpportunity: (oppId: string, activityId: string) => void;

  // Cotizaciones
  getQuotationByOpportunity: (oppId: string) => Quotation | undefined;
  getQuotationById: (id: string) => Quotation | undefined;
  saveQuotation: (quotation: Quotation) => void;
  convertQuotationToInvoice: (quotationId: string) => Invoice;

  // Facturas
  getInvoiceById: (id: string) => Invoice | undefined;
  getInvoiceByQuotation: (quotationId: string) => Invoice | undefined;
  registerPayment: (invoiceId: string, payment: Omit<Payment, 'id' | 'status'>) => Invoice;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SalesContext = createContext<SalesContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SalesProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  const addOpportunity = useCallback((data: NewOpportunityData): Opportunity => {
    const now = new Date().toISOString();
    const templates = STAGE_CHECKLIST_TEMPLATES[data.stage] ?? [];
    const newOpp: Opportunity = {
      ...data,
      id: `opp-${Date.now()}`,
      createdAt: now.split('T')[0],
      stageEnteredAt: now,
      stageHistory: [{ stage: data.stage, enteredAt: now }],
      checklist: templates.map((text, i) => ({
        id: `chk-${Date.now()}-${i}`,
        text,
        done: false,
      })),
    };
    setOpportunities((prev) => [...prev, newOpp]);
    return newOpp;
  }, []);

  const moveOpportunity = useCallback(
    (
      id: string,
      stage: StageId,
      payload?: { outcome?: 'ganado' | 'perdido'; lostReason?: LostReasonInfo }
    ) => {
      const now = new Date().toISOString();
      setOpportunities((prev) =>
        prev.map((opp) => {
          if (opp.id !== id) return opp;
          const updatedHistory = opp.stageHistory.map((entry) =>
            !entry.exitedAt ? { ...entry, exitedAt: now } : entry
          );
          return {
            ...opp,
            stage,
            stageEnteredAt: now,
            stageHistory: [...updatedHistory, { stage, enteredAt: now }],
            ...(payload?.outcome ? { outcome: payload.outcome } : {}),
            ...(payload?.lostReason ? { lostReason: payload.lostReason } : {}),
          };
        })
      );
    },
    []
  );

  const toggleChecklistItem = useCallback((oppId: string, itemId: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== oppId) return opp;
        return {
          ...opp,
          checklist: opp.checklist.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        };
      })
    );
  }, []);

  const addChecklistItem = useCallback((oppId: string, text: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== oppId) return opp;
        return {
          ...opp,
          checklist: [...opp.checklist, { id: `chk-${Date.now()}`, text, done: false }],
        };
      })
    );
  }, []);

  const removeChecklistItem = useCallback((oppId: string, itemId: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== oppId) return opp;
        return {
          ...opp,
          checklist: opp.checklist.filter((item) => item.id !== itemId),
        };
      })
    );
  }, []);

  const addActivityToOpportunity = useCallback((id: string, activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
    };
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== id) return opp;
        return {
          ...opp,
          activities: [newActivity, ...opp.activities],
          lastActivityAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const addNoteToOpportunity = useCallback(
    (id: string, noteData: Omit<Note, 'id' | 'createdAt'>) => {
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setOpportunities((prev) =>
        prev.map((opp) => {
          if (opp.id !== id) return opp;
          return {
            ...opp,
            notes: [newNote, ...opp.notes],
          };
        })
      );
    },
    []
  );

  const updateNoteInOpportunity = useCallback((oppId: string, noteId: string, text: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== oppId) return opp;
        return {
          ...opp,
          notes: opp.notes.map((n) => (n.id === noteId ? { ...n, content: text } : n)),
        };
      })
    );
  }, []);

  const removeNoteFromOpportunity = useCallback((oppId: string, noteId: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== oppId) return opp;
        return {
          ...opp,
          notes: opp.notes.filter((n) => n.id !== noteId),
        };
      })
    );
  }, []);

  const updateActivityInOpportunity = useCallback(
    (oppId: string, activityId: string, data: Partial<Activity>) => {
      setOpportunities((prev) =>
        prev.map((opp) => {
          if (opp.id !== oppId) return opp;
          return {
            ...opp,
            activities: opp.activities.map((a) => (a.id === activityId ? { ...a, ...data } : a)),
          };
        })
      );
    },
    []
  );

  const removeActivityFromOpportunity = useCallback((oppId: string, activityId: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== oppId) return opp;
        return {
          ...opp,
          activities: opp.activities.filter((a) => a.id !== activityId),
        };
      })
    );
  }, []);

  // ── Cotizaciones ───────────────────────────────────────────────────────────

  const getQuotationByOpportunity = useCallback(
    (oppId: string) => quotations.find((q) => q.opportunityId === oppId),
    [quotations]
  );

  const getQuotationById = useCallback(
    (id: string) => quotations.find((q) => q.id === id),
    [quotations]
  );

  const saveQuotation = useCallback((quotation: Quotation) => {
    setQuotations((prev) => {
      const exists = prev.find((q) => q.id === quotation.id);
      if (exists) {
        return prev.map((q) => (q.id === quotation.id ? quotation : q));
      }
      return [...prev, quotation];
    });
    // Si la oportunidad estaba en Leads, avanzar a Contactado al enviar cotización
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== quotation.opportunityId || opp.stage !== 'leads') return opp;
        const now = new Date().toISOString();
        const updatedHistory = opp.stageHistory.map((e) =>
          !e.exitedAt ? { ...e, exitedAt: now } : e
        );
        return {
          ...opp,
          stage: 'contactado' as StageId,
          quotationId: quotation.id,
          stageEnteredAt: now,
          stageHistory: [...updatedHistory, { stage: 'contactado' as StageId, enteredAt: now }],
        };
      })
    );
  }, []);

  const convertQuotationToInvoice = useCallback(
    (quotationId: string): Invoice => {
      const quotation = quotations.find((q) => q.id === quotationId);
      if (!quotation) throw new Error(`Quotation ${quotationId} not found`);

      const issueDate = new Date();
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);

      const invoiceLines = quotation.products.map((p: ProductLine) => {
        const discountedPrice = p.unitPrice * (1 - p.discount / 100);
        const subtotal = discountedPrice * p.qty;
        return {
          code: p.sku,
          name: p.name,
          qty: p.qty,
          unitPrice: p.unitPrice,
          discount: p.discount,
          tax: 19,
          subtotal,
        };
      });

      const total = invoiceLines.reduce((sum, l) => sum + l.subtotal * 1.19, 0);

      const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        quotationId,
        client: quotation.client,
        clientNif: 'B00000000',
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        paymentMethod: 'Transferencia Bancaria',
        seller: quotation.seller,
        status: 'pendiente',
        total: Math.round(total * 100) / 100,
        totalPaid: 0,
        products: invoiceLines,
        payments: [],
      };

      setInvoices((prev) => [...prev, newInvoice]);

      // Avanzar oportunidad a Cerrado (ganado) automáticamente cuando se emite la factura
      setOpportunities((prev) =>
        prev.map((opp) => {
          if (opp.quotationId !== quotationId) return opp;
          const now = new Date().toISOString();
          const updatedHistory = opp.stageHistory.map((e) =>
            !e.exitedAt ? { ...e, exitedAt: now } : e
          );
          return {
            ...opp,
            stage: 'cerrado' as StageId,
            outcome: 'ganado' as const,
            stageEnteredAt: now,
            stageHistory: [...updatedHistory, { stage: 'cerrado' as StageId, enteredAt: now }],
          };
        })
      );

      return newInvoice;
    },
    [quotations]
  );

  // ── Facturas ───────────────────────────────────────────────────────────────

  const getInvoiceById = useCallback(
    (id: string) => invoices.find((inv) => inv.id === id),
    [invoices]
  );

  const getInvoiceByQuotation = useCallback(
    (quotationId: string) => invoices.find((inv) => inv.quotationId === quotationId),
    [invoices]
  );

  const registerPayment = useCallback(
    (invoiceId: string, payment: Omit<Payment, 'id' | 'status'>): Invoice => {
      // Find the invoice first so we can compute the new state synchronously
      const inv = invoices.find((i) => i.id === invoiceId);
      if (!inv) throw new Error(`Invoice ${invoiceId} not found`);

      const newPayment: Payment = {
        ...payment,
        id: `pay-${Date.now()}`,
        status: 'confirmado',
      };

      const newTotalPaid = inv.totalPaid + payment.amount;
      const newStatus: Invoice['status'] = newTotalPaid >= inv.total ? 'pagada' : 'parcial';

      const updatedInvoice: Invoice = {
        ...inv,
        totalPaid: Math.round(newTotalPaid * 100) / 100,
        status: newStatus,
        payments: [...inv.payments, newPayment],
      };

      setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? updatedInvoice : i)));

      // Si la factura está totalmente pagada, mover la oportunidad a Cerrado (ganado)
      if (updatedInvoice.status === 'pagada') {
        setOpportunities((prev) =>
          prev.map((opp) =>
            opp.quotationId === updatedInvoice.quotationId
              ? { ...opp, stage: 'cerrado' as StageId, outcome: 'ganado' as const }
              : opp
          )
        );
      }

      return updatedInvoice;
    },
    [invoices]
  );

  return (
    <SalesContext.Provider
      value={{
        opportunities,
        quotations,
        invoices,
        addOpportunity,
        moveOpportunity,
        toggleChecklistItem,
        addChecklistItem,
        removeChecklistItem,
        addActivityToOpportunity,
        addNoteToOpportunity,
        updateNoteInOpportunity,
        removeNoteFromOpportunity,
        updateActivityInOpportunity,
        removeActivityFromOpportunity,
        getQuotationByOpportunity,
        getQuotationById,
        saveQuotation,
        convertQuotationToInvoice,
        getInvoiceById,
        getInvoiceByQuotation,
        registerPayment,
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

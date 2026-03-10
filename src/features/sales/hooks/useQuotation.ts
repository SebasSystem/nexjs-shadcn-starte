'use client';

import { useSalesContext } from '../context/SalesContext';

export function useQuotation(opportunityId: string) {
  const { getQuotationByOpportunity, saveQuotation, convertQuotationToInvoice } = useSalesContext();

  const quotation = getQuotationByOpportunity(opportunityId);

  return {
    quotation,
    saveQuotation,
    convertQuotationToInvoice,
  };
}

export function useQuotationById(quotationId: string) {
  const { getQuotationById, saveQuotation, convertQuotationToInvoice, getInvoiceByQuotation } =
    useSalesContext();

  const quotation = getQuotationById(quotationId);
  const invoice = quotation ? getInvoiceByQuotation(quotation.id) : undefined;

  return {
    quotation,
    invoice,
    saveQuotation,
    convertQuotationToInvoice,
  };
}

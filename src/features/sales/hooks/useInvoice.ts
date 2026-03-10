'use client';

import { useSalesContext } from '../context/SalesContext';

export function useInvoice(invoiceId: string) {
  const { getInvoiceById, registerPayment } = useSalesContext();

  const invoice = getInvoiceById(invoiceId);

  return {
    invoice,
    registerPayment,
  };
}

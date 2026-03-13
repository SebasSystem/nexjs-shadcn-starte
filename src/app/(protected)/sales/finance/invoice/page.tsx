import { FinanceInvoiceDetailView } from 'src/features/sales/views/FinanceInvoiceDetailView';

export const metadata = {
  title: 'Detalle de Factura | CRM',
  description: 'Registro de pagos y detalle de factura.',
};

export default function FinanceInvoicePage() {
  return <FinanceInvoiceDetailView />;
}

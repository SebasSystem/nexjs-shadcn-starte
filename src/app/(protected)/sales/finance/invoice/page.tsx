import { InvoicesListView } from 'src/features/sales/views/InvoicesListView';

export const metadata = {
  title: 'Facturas | CRM',
  description: 'Historial y gestión de facturas.',
};

export default function FinanceInvoicePage() {
  return <InvoicesListView />;
}

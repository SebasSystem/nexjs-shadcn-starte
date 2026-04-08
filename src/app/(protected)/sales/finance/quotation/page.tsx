import { QuotationsListView } from 'src/features/sales/views/QuotationsListView';

export const metadata = {
  title: 'Cotizaciones | CRM',
  description: 'Historial y gestión de cotizaciones.',
};

export default function FinanceQuotationPage() {
  return <QuotationsListView />;
}

import { FinanceCPQView } from 'src/features/sales/views/FinanceCPQView';

export const metadata = {
  title: 'Cotizador CPQ | CRM',
  description: 'Genera cotizaciones profesionales con control de márgenes.',
};

export default function FinanceQuotationPage() {
  return <FinanceCPQView />;
}

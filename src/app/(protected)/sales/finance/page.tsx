import { FinanceDashboardView } from 'src/features/sales/views/FinanceDashboardView';

export const metadata = {
  title: 'Dashboard Financiero | CRM',
  description: 'Resumen de ventas, facturas y cartera del período actual.',
};

export default function FinancePage() {
  return <FinanceDashboardView />;
}

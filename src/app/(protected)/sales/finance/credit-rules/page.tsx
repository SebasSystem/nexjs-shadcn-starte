import { CreditRulesView } from 'src/features/sales/views/CreditRulesView';

export const metadata = {
  title: 'Reglas de Crédito | CRM',
  description: 'Configura las políticas de crédito y bloqueo automático.',
};

export default function CreditRulesPage() {
  return <CreditRulesView />;
}

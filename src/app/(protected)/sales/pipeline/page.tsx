import { PipelineView } from 'src/features/sales/views/PipelineView';

export const metadata = {
  title: 'Pipeline Comercial | CRM',
  description:
    'Gestiona y visualiza el avance de tus oportunidades de venta en el pipeline comercial.',
};

export default function PipelinePage() {
  return <PipelineView />;
}

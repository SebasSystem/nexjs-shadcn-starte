'use client';

import { Badge } from 'src/shared/components/ui/badge';
import { EstadoFactura } from 'src/features/admin/types/admin.types';

interface BillingStatusBadgeProps {
  estado: EstadoFactura;
}

const estadoConfig: Record<EstadoFactura, { label: string; className: string }> = {
  PAGADA: { label: 'Pagada', className: 'bg-emerald-100 text-emerald-700 border-transparent' },
  PENDIENTE: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700 border-transparent' },
  VENCIDA: { label: 'Vencida', className: 'bg-red-100 text-red-700 border-transparent' },
  CANCELADA: { label: 'Cancelada', className: 'bg-gray-100 text-gray-400 border-transparent' },
};

export function BillingStatusBadge({ estado }: BillingStatusBadgeProps) {
  const config = estadoConfig[estado];
  return (
    <Badge variant="soft" className={config.className}>
      {config.label}
    </Badge>
  );
}

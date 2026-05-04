'use client';

import { EstadoTenant } from 'src/features/admin/types/admin.types';
import { Badge } from 'src/shared/components/ui/badge';

interface TenantStatusBadgeProps {
  estado: EstadoTenant;
}

const estadoConfig: Record<EstadoTenant, { label: string; className: string }> = {
  ACTIVO: { label: 'Activo', className: 'bg-emerald-100 text-emerald-700 border-transparent' },
  TRIAL: { label: 'Trial', className: 'bg-blue-100 text-blue-700 border-transparent' },
  VENCIDO: { label: 'Vencido', className: 'bg-amber-100 text-amber-700 border-transparent' },
  SUSPENDIDO: { label: 'Suspendido', className: 'bg-red-100 text-red-700 border-transparent' },
  INACTIVO: { label: 'Inactivo', className: 'bg-gray-100 text-gray-500 border-transparent' },
};

export function TenantStatusBadge({ estado }: TenantStatusBadgeProps) {
  const config = estadoConfig[estado];
  return (
    <Badge variant="soft" className={config.className}>
      {config.label}
    </Badge>
  );
}

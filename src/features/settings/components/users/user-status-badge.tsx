import { Badge } from 'src/shared/components/ui/badge';

import type { EstadoUsuario } from '../../types/settings.types';

const CONFIG: Record<EstadoUsuario, { label: string; color: 'success' | 'warning' | 'default' }> = {
  ACTIVO: { label: 'Activo', color: 'success' },
  PENDIENTE: { label: 'Pendiente', color: 'warning' },
  INACTIVO: { label: 'Inactivo', color: 'default' },
};

export function UserStatusBadge({ estado }: { estado: EstadoUsuario }) {
  const { label, color } = CONFIG[estado] ?? CONFIG.INACTIVO;
  return (
    <Badge variant="soft" color={color}>
      {label}
    </Badge>
  );
}

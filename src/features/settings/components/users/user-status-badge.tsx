import { Badge } from 'src/shared/components/ui/badge';

import type { UserStatus } from '../../types/settings.types';

const CONFIG: Record<UserStatus, { label: string; color: 'success' | 'warning' | 'default' }> = {
  ACTIVO: { label: 'Activo', color: 'success' },
  PENDIENTE: { label: 'Pendiente', color: 'warning' },
  INACTIVO: { label: 'Inactivo', color: 'default' },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const { label, color } = CONFIG[status] ?? CONFIG.INACTIVO;
  return (
    <Badge variant="soft" color={color}>
      {label}
    </Badge>
  );
}

import { Badge } from 'src/shared/components/ui/badge';
import type { EstadoContacto } from '../types/contacts.types';

const CONFIG: Record<EstadoContacto, { label: string; color: 'success' | 'default' | 'warning' }> =
  {
    ACTIVO: { label: 'Activo', color: 'success' },
    PROSPECTO: { label: 'Prospecto', color: 'warning' },
    INACTIVO: { label: 'Inactivo', color: 'default' },
  };

export function ContactStatusBadge({ estado }: { estado: EstadoContacto }) {
  const { label, color } = CONFIG[estado] ?? CONFIG.INACTIVO;
  return (
    <Badge variant="soft" color={color}>
      {label}
    </Badge>
  );
}

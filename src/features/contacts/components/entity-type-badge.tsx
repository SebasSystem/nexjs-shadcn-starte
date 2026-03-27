import { Badge } from 'src/shared/components/ui/badge';
import type { TipoEntidad } from '../types/contacts.types';

const CONFIG: Record<TipoEntidad, { label: string; color: 'info' | 'success' | 'warning' }> = {
  B2B: { label: 'B2B · Empresa', color: 'info' },
  B2C: { label: 'B2C · Persona', color: 'success' },
  B2G: { label: 'B2G · Institución', color: 'warning' },
};

export function EntityTypeBadge({ tipo }: { tipo: TipoEntidad }) {
  const { label, color } = CONFIG[tipo];
  return (
    <Badge variant="soft" color={color} className="text-xs whitespace-nowrap">
      {label}
    </Badge>
  );
}

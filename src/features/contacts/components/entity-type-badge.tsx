import { Badge } from 'src/shared/components/ui/badge';

import type { ContactType } from '../types/contacts.types';

const CONFIG: Record<ContactType, { label: string; color: 'info' | 'success' | 'warning' }> = {
  company: { label: 'Empresa', color: 'info' },
  person: { label: 'Persona', color: 'success' },
  government: { label: 'Institución', color: 'warning' },
};

export function EntityTypeBadge({ type }: { type: ContactType }) {
  const { label, color } = CONFIG[type];
  return (
    <Badge variant="soft" color={color} className="text-xs whitespace-nowrap">
      {label}
    </Badge>
  );
}

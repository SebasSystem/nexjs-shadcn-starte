import { Badge } from 'src/shared/components/ui/badge';

import type { ContactStatus } from '../types/contacts.types';

const CONFIG: Record<ContactStatus, { label: string; color: 'success' | 'default' | 'warning' }> = {
  active: { label: 'Activo', color: 'success' },
  prospect: { label: 'Prospecto', color: 'warning' },
  inactive: { label: 'Inactivo', color: 'default' },
};

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const { label, color } = CONFIG[status] ?? CONFIG.inactive;
  return (
    <Badge variant="soft" color={color}>
      {label}
    </Badge>
  );
}

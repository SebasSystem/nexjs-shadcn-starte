import type { StockStatus } from 'src/_mock/_inventories';
import { Badge } from 'src/shared/components/ui';

interface StockBadgeProps {
  status: StockStatus;
}

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; color: 'success' | 'warning' | 'error' | 'info' }
> = {
  available: { label: 'Disponible', color: 'success' },
  low_stock: { label: 'Stock bajo', color: 'warning' },
  out_of_stock: { label: 'Sin stock', color: 'error' },
  reserved: { label: 'Reservado', color: 'info' },
};

export function StockBadge({ status }: StockBadgeProps) {
  const { label, color } = STATUS_CONFIG[status] || STATUS_CONFIG['available'];
  return (
    <Badge variant="soft" color={color}>
      {label}
    </Badge>
  );
}

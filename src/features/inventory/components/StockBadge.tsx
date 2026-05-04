import { Badge } from 'src/shared/components/ui';

type StockState = 'normal' | 'low' | 'out';

interface StockBadgeProps {
  status: StockState;
}

const STATUS_CONFIG: Record<StockState, { label: string; color: 'success' | 'warning' | 'error' }> =
  {
    normal: { label: 'Disponible', color: 'success' },
    low: { label: 'Stock bajo', color: 'warning' },
    out: { label: 'Sin stock', color: 'error' },
  };

export function StockBadge({ status }: StockBadgeProps) {
  const { label, color } = STATUS_CONFIG[status] ?? STATUS_CONFIG['normal'];
  return (
    <Badge variant="soft" color={color}>
      {label}
    </Badge>
  );
}

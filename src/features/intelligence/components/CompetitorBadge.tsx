import { Badge } from 'src/shared/components/ui';
import { COMPETITOR_TIER_CONFIG } from 'src/_mock/_intelligence';
import type { CompetitorTier } from '../types';

interface Props {
  tier: CompetitorTier;
}

export function CompetitorBadge({ tier }: Props) {
  const config = COMPETITOR_TIER_CONFIG[tier];
  return (
    <Badge variant="soft" color={config.color}>
      {config.label}
    </Badge>
  );
}

import { Badge } from 'src/shared/components/ui';

import type { MilestoneStatus } from '../types';
import { MILESTONE_STATUS_CONFIG } from '../types';

interface Props {
  status: MilestoneStatus;
}

export function MilestoneStatusBadge({ status }: Props) {
  const config = MILESTONE_STATUS_CONFIG[status];
  return (
    <Badge variant="soft" color={config.color}>
      {config.label}
    </Badge>
  );
}

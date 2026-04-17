import { Badge } from 'src/shared/components/ui';
import { PROJECT_STATUS_CONFIG } from 'src/_mock/_projects';
import type { ProjectStatus } from '../types';

interface Props {
  status: ProjectStatus;
}

export function ProjectStatusBadge({ status }: Props) {
  const config = PROJECT_STATUS_CONFIG[status];
  return (
    <Badge variant="soft" color={config.color}>
      {config.label}
    </Badge>
  );
}

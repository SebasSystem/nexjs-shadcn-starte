import { toast } from 'sonner';
import { formatDate } from 'src/lib/date';
import { cn } from 'src/lib/utils';
import { SectionCard } from 'src/shared/components/layouts/page';
import { Badge, Button, Icon } from 'src/shared/components/ui';

import type { PortalMaterial } from '../types';
import { MATERIAL_TYPE_CONFIG } from '../types';

// ─── Icon map for material types ──────────────────────────────────────────────

const MATERIAL_ICON_BG: Record<string, string> = {
  deck: 'bg-primary/10 text-primary',
  training: 'bg-info/10 text-info',
  product_sheet: 'bg-success/10 text-success',
  guide: 'bg-warning/10 text-warning',
  contract_template: 'bg-secondary/10 text-secondary-foreground',
};

interface Props {
  material: PortalMaterial;
}

export function MaterialCard({ material }: Props) {
  const typeConfig = MATERIAL_TYPE_CONFIG[material.type];
  const iconBg = MATERIAL_ICON_BG[material.type] ?? 'bg-muted text-muted-foreground';

  const handleDownload = () => {
    toast.success(`"${material.title}" descargado exitosamente.`);
  };

  return (
    <SectionCard className="p-4 flex flex-col hover:shadow-md transition-shadow">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon name={typeConfig.icon as 'FileText'} size={18} />
      </div>

      <h3 className="text-subtitle2 font-semibold text-foreground mt-3 line-clamp-2 leading-snug">
        {material.title}
      </h3>

      <p className="text-caption text-muted-foreground mt-1 line-clamp-2 flex-1">
        {material.description}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <Badge variant="soft" color="secondary" className="text-[10px]">
          {typeConfig.label}
        </Badge>
        {material.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
        <div className="flex items-center justify-between text-caption text-muted-foreground">
          <span className="font-mono truncate">{material.file_name}</span>
          <span className="shrink-0 ml-2">{material.file_size}</span>
        </div>
        <div className="flex items-center justify-between text-caption text-muted-foreground">
          <span>{formatDate(material.uploaded_at)}</span>
          <span>{material.download_count} descargas</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleDownload}>
        <Icon name="Download" size={14} />
        Descargar
      </Button>
    </SectionCard>
  );
}

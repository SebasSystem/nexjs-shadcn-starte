import { cn } from 'src/lib/utils';
import { SectionCard } from 'src/shared/components/layouts/page';
import { Button, Icon } from 'src/shared/components/ui';

import type { Battlecard } from '../types';

interface Props {
  battlecard: Battlecard;
  onEdit: (bc: Battlecard) => void;
  onDelete: (uid: string) => void;
}

function WinRateBar({ rate }: { rate: number }) {
  const color = rate >= 60 ? 'bg-success' : rate >= 40 ? 'bg-warning' : 'bg-error';
  const textColor = rate >= 60 ? 'text-success' : rate >= 40 ? 'text-warning' : 'text-error';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-caption text-muted-foreground">Win rate</span>
        <span className={cn('text-caption font-bold', textColor)}>{rate}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

export function BattlecardCard({ battlecard, onEdit, onDelete }: Props) {
  return (
    <SectionCard className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-subtitle2 font-bold text-foreground">{battlecard.competitor_name}</h3>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(battlecard)}
            aria-label="Editar battlecard"
          >
            <Icon name="Pencil" size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            color="error"
            onClick={() => onDelete(battlecard.uid)}
            aria-label="Eliminar battlecard"
          >
            <Icon name="Trash2" size={15} />
          </Button>
        </div>
      </div>

      {/* Win rate */}
      <WinRateBar rate={battlecard.win_rate} />

      {/* Deals */}
      <p className="text-caption text-muted-foreground">
        {battlecard.deals_won} ganados de {battlecard.deals_tracked} deals
      </p>

      {/* Nuestras ventajas (top 3) */}
      <div className="space-y-1.5">
        <p className="text-caption font-semibold text-foreground uppercase tracking-wide">
          Nuestras ventajas
        </p>
        <ul className="space-y-1">
          {battlecard.our_strengths.slice(0, 3).map((s, i) => (
            <li key={i} className="flex items-start gap-1.5 text-caption text-muted-foreground">
              <Icon name="CheckCircle2" size={13} className="text-success shrink-0 mt-0.5" />
              {s}
            </li>
          ))}
          {battlecard.our_strengths.length > 3 && (
            <li className="text-caption text-muted-foreground/60">
              +{battlecard.our_strengths.length - 3} más...
            </li>
          )}
        </ul>
      </div>

      {/* Summary */}
      <p className="text-caption text-muted-foreground line-clamp-2 border-t border-border/40 pt-3">
        {battlecard.summary}
      </p>

      {/* Footer */}
      <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(battlecard)}>
        <Icon name="Swords" size={14} />
        Ver ficha completa
      </Button>
    </SectionCard>
  );
}

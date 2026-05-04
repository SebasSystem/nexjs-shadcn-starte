import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from 'src/shared/components/ui';
import { Textarea } from 'src/shared/components/ui';
import { Icon } from 'src/shared/components/ui';

import type { BattlecardFormData } from '../schemas/battlecard.schema';

interface Props {
  index: number;
  register: UseFormRegister<BattlecardFormData>;
  errors: FieldErrors<BattlecardFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export function ObjectionItem({ index, register, errors, onRemove, canRemove }: Props) {
  const objectionError = errors.objections?.[index]?.objection?.message;
  const responseError = errors.objections?.[index]?.response?.message;

  return (
    <div className="rounded-xl border border-border/60 p-4 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
          Objeción {index + 1}
        </span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            color="error"
            onClick={onRemove}
            aria-label="Eliminar objeción"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        )}
      </div>

      <Textarea
        label="El cliente dice..."
        {...register(`objections.${index}.objection`)}
        placeholder="Ej: Odoo es open source, ¿por qué pagar por su solución?"
        rows={2}
        error={objectionError}
      />

      <Textarea
        label="El vendedor responde..."
        {...register(`objections.${index}.response`)}
        placeholder="Respuesta clara, directa y con evidencia..."
        rows={3}
        error={responseError}
      />
    </div>
  );
}

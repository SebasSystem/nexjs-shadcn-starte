'use client';

import { useFieldArray } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { Trash2, Plus } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { SectionCard } from 'src/shared/components/layouts/page';
import { cn } from 'src/lib/utils';
import { CONDITION_OPERATOR_LABELS } from '../types';
import type { RuleFormData } from '../schemas/rule.schema';
import type { ConditionOperator } from '../types';

const OPERATOR_OPTIONS = (Object.keys(CONDITION_OPERATOR_LABELS) as ConditionOperator[]).map(
  (key) => ({
    value: key,
    label: CONDITION_OPERATOR_LABELS[key],
  })
);

const VALUELESS_OPERATORS: ConditionOperator[] = ['exists', 'not_exists'];

interface ConditionBlockProps {
  form: UseFormReturn<RuleFormData>;
  groupIndex: number;
}

export function ConditionBlock({ form, groupIndex }: ConditionBlockProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `conditionGroups.${groupIndex}.conditions`,
  });

  const logic = form.watch(`conditionGroups.${groupIndex}.logic`);

  const handleAddCondition = () => {
    append({
      id: `cond-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
    });
  };

  const toggleLogic = () => {
    form.setValue(`conditionGroups.${groupIndex}.logic`, logic === 'AND' ? 'OR' : 'AND');
  };

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          2. Condiciones (opcional)
        </h3>
        {fields.length > 1 && (
          <button
            type="button"
            onClick={toggleLogic}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-bold border transition-colors',
              logic === 'AND'
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
            )}
          >
            {logic}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sin condiciones — la regla se dispara siempre que ocurra el trigger.
          </p>
        )}

        {fields.map((field, index) => {
          const operator = form.watch(`conditionGroups.${groupIndex}.conditions.${index}.operator`);
          const hideValue = VALUELESS_OPERATORS.includes(operator as ConditionOperator);

          return (
            <div key={field.id} className="flex items-end gap-2">
              {index > 0 && (
                <span className="text-[10px] font-bold text-muted-foreground w-6 text-center shrink-0 mb-2.5">
                  {logic}
                </span>
              )}
              {index === 0 && <div className="w-6 shrink-0" />}

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder="Campo (ej: source)"
                  value={form.watch(`conditionGroups.${groupIndex}.conditions.${index}.field`)}
                  onChange={(e) =>
                    form.setValue(
                      `conditionGroups.${groupIndex}.conditions.${index}.field`,
                      e.target.value
                    )
                  }
                />
                <SelectField
                  options={OPERATOR_OPTIONS}
                  value={operator}
                  onChange={(v) =>
                    form.setValue(
                      `conditionGroups.${groupIndex}.conditions.${index}.operator`,
                      v as ConditionOperator
                    )
                  }
                />
                {!hideValue ? (
                  <Input
                    placeholder="Valor"
                    value={String(
                      form.watch(`conditionGroups.${groupIndex}.conditions.${index}.value`) ?? ''
                    )}
                    onChange={(e) =>
                      form.setValue(
                        `conditionGroups.${groupIndex}.conditions.${index}.value`,
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <div />
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="mb-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 gap-1.5 text-xs"
        onClick={handleAddCondition}
      >
        <Plus size={13} />
        Agregar condición
      </Button>
    </SectionCard>
  );
}

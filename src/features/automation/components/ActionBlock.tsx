'use client';

import { useFieldArray } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { Trash2, Plus } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { SectionCard } from 'src/shared/components/layouts/page';
import { ACTION_TYPE_LABELS } from '../types';
import { MOCK_ASSIGNMENT_RULES, MOCK_AUTOMATION_USERS } from 'src/_mock/_automation';
import type { RuleFormData } from '../schemas/rule.schema';
import type { ActionType } from '../types';

const ACTION_OPTIONS = (Object.keys(ACTION_TYPE_LABELS) as ActionType[]).map((key) => ({
  value: key,
  label: ACTION_TYPE_LABELS[key],
}));

const ASSIGNMENT_RULE_OPTIONS = MOCK_ASSIGNMENT_RULES.map((r) => ({
  value: r.id,
  label: r.name,
}));

const USER_OPTIONS = MOCK_AUTOMATION_USERS.map((u) => ({
  value: u.id,
  label: u.name,
}));

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'llamada', label: 'Llamada' },
  { value: 'email', label: 'Email' },
  { value: 'reunion', label: 'Reunión' },
  { value: 'seguimiento', label: 'Seguimiento' },
];

interface ActionBlockProps {
  form: UseFormReturn<RuleFormData>;
}

export function ActionBlock({ form }: ActionBlockProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'actions',
  });

  const handleAddAction = () => {
    append({
      id: `act-${Date.now()}`,
      sequence: fields.length + 1,
      type: 'send_notification',
      config: {},
    });
  };

  return (
    <SectionCard>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
        3. Acciones — ¿Qué ejecutar?
      </h3>

      <div className="space-y-4">
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Agregá al menos una acción para que la regla funcione.
          </p>
        )}

        {fields.map((field, index) => {
          const actionType = form.watch(`actions.${index}.type`);

          return (
            <div
              key={field.id}
              className="rounded-xl border border-border/50 p-4 space-y-3 bg-muted/20"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground">Acción {index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <SelectField
                label="Tipo de acción"
                options={ACTION_OPTIONS}
                value={actionType}
                onChange={(v) => form.setValue(`actions.${index}.type`, v as ActionType)}
              />

              {actionType === 'assign_owner' && (
                <SelectField
                  label="Regla de asignación"
                  options={ASSIGNMENT_RULE_OPTIONS}
                  value={form.watch(`actions.${index}.config.assignmentRuleId`) ?? ''}
                  onChange={(v) =>
                    form.setValue(`actions.${index}.config.assignmentRuleId`, v as string)
                  }
                />
              )}

              {actionType === 'create_activity' && (
                <div className="space-y-3">
                  <SelectField
                    label="Tipo de actividad"
                    options={ACTIVITY_TYPE_OPTIONS}
                    value={form.watch(`actions.${index}.config.activityType`) ?? ''}
                    onChange={(v) =>
                      form.setValue(`actions.${index}.config.activityType`, v as string)
                    }
                  />
                  <Input
                    label="Notas"
                    placeholder="Descripción de la actividad..."
                    value={form.watch(`actions.${index}.config.activityNotes`) ?? ''}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.activityNotes`, e.target.value)
                    }
                  />
                </div>
              )}

              {actionType === 'apply_tag' && (
                <Input
                  label="Etiqueta"
                  placeholder="Ej: linkedin-lead"
                  value={form.watch(`actions.${index}.config.tag`) ?? ''}
                  onChange={(e) => form.setValue(`actions.${index}.config.tag`, e.target.value)}
                />
              )}

              {actionType === 'send_notification' && (
                <div className="space-y-3">
                  <SelectField
                    label="Notificar a"
                    options={USER_OPTIONS}
                    value={form.watch(`actions.${index}.config.notifyUserId`) ?? ''}
                    onChange={(v) =>
                      form.setValue(`actions.${index}.config.notifyUserId`, v as string)
                    }
                  />
                  <Input
                    label="Mensaje"
                    placeholder="Ej: Nuevo lead asignado a tu equipo"
                    value={form.watch(`actions.${index}.config.notificationMessage`) ?? ''}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.notificationMessage`, e.target.value)
                    }
                  />
                </div>
              )}

              {actionType === 'update_field' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Campo"
                    placeholder="Ej: status"
                    value={form.watch(`actions.${index}.config.fieldName`) ?? ''}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.fieldName`, e.target.value)
                    }
                  />
                  <Input
                    label="Valor"
                    placeholder="Ej: activo"
                    value={String(form.watch(`actions.${index}.config.fieldValue`) ?? '')}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.fieldValue`, e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 gap-1.5 text-xs"
        onClick={handleAddAction}
      >
        <Plus size={13} />
        Agregar acción
      </Button>
    </SectionCard>
  );
}

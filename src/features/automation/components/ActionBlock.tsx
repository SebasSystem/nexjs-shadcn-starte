'use client';

import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import { useTenantOptions } from 'src/shared/hooks/useTenantOptions';

import { useUsers } from '../hooks/useUsers';
import type { RuleFormData } from '../schemas/rule.schema';
import type { ActionType, AssignmentRule } from '../types';
import { ACTION_TYPE_LABELS } from '../types';

const ACTION_OPTIONS = (Object.keys(ACTION_TYPE_LABELS) as ActionType[]).map((key) => ({
  value: key,
  label: ACTION_TYPE_LABELS[key],
}));

interface ActionBlockProps {
  form: UseFormReturn<RuleFormData>;
  assignmentRules: AssignmentRule[];
}

export function ActionBlock({ form, assignmentRules }: ActionBlockProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'actions',
  });

  const { userOptions } = useUsers();
  const { activityTypes } = useTenantOptions();

  const activityTypeOptions = useMemo(() => {
    const data = activityTypes.data as { uid: string; name: string }[] | undefined;
    if (!data || data.length === 0) {
      return [{ value: '', label: 'Cargando...' }];
    }
    return data.map((opt) => ({ value: opt.uid, label: opt.name }));
  }, [activityTypes.data]);

  const ASSIGNMENT_RULE_OPTIONS = assignmentRules.map((r) => ({
    value: r.uid,
    label: r.name,
  }));

  const handleAddAction = () => {
    append({
      uid: `act-${Date.now()}`,
      sequence: fields.length + 1,
      type: 'send_email',
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
              key={field.uid}
              className="rounded-xl border border-border/50 p-4 space-y-3 bg-muted/20"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground">Acción {index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Icon name="Trash2" size={13} />
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
                  value={form.getValues(`actions.${index}.config.assignment_rule_id`) ?? ''}
                  onChange={(v) =>
                    form.setValue(`actions.${index}.config.assignment_rule_id`, v as string)
                  }
                />
              )}

              {actionType === 'create_activity' && (
                <div className="space-y-3">
                  <SelectField
                    label="Tipo de actividad"
                    options={activityTypeOptions}
                    value={form.getValues(`actions.${index}.config.activity_type`) ?? ''}
                    onChange={(v) =>
                      form.setValue(`actions.${index}.config.activity_type`, v as string)
                    }
                  />
                  <Input
                    label="Notas"
                    placeholder="Descripción de la actividad..."
                    value={String(form.getValues(`actions.${index}.config.activity_notes`) ?? '')}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.activity_notes`, e.target.value)
                    }
                  />
                </div>
              )}

              {actionType === 'apply_tag' && (
                <Input
                  label="Etiqueta"
                  placeholder="Ej: linkedin-lead"
                  value={String(form.getValues(`actions.${index}.config.tag`) ?? '')}
                  onChange={(e) => form.setValue(`actions.${index}.config.tag`, e.target.value)}
                />
              )}

              {actionType === 'send_notification' && (
                <div className="space-y-3">
                  <SelectField
                    label="Notificar a"
                    options={userOptions ?? []}
                    value={form.getValues(`actions.${index}.config.notify_user_id`) ?? ''}
                    onChange={(v) =>
                      form.setValue(`actions.${index}.config.notify_user_id`, v as string)
                    }
                  />
                  <Input
                    label="Mensaje"
                    placeholder="Ej: Nuevo lead asignado a tu equipo"
                    value={String(
                      form.getValues(`actions.${index}.config.notification_message`) ?? ''
                    )}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.notification_message`, e.target.value)
                    }
                  />
                </div>
              )}

              {actionType === 'create_lead' && (
                <div className="space-y-3">
                  <Input
                    label="Destinatario"
                    placeholder="Email del destinatario"
                    value={String(form.getValues(`actions.${index}.config.to`) ?? '')}
                    onChange={(e) => form.setValue(`actions.${index}.config.to`, e.target.value)}
                  />
                  <Input
                    label="Asunto"
                    placeholder="Asunto del email"
                    value={String(form.getValues(`actions.${index}.config.subject`) ?? '')}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.subject`, e.target.value)
                    }
                  />
                </div>
              )}

              {actionType === 'update_field' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Campo"
                    placeholder="Ej: status"
                    value={String(form.watch(`actions.${index}.config.field_name`) ?? '')}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.field_name`, e.target.value)
                    }
                  />
                  <Input
                    label="Valor"
                    placeholder="Ej: activo"
                    value={String(form.watch(`actions.${index}.config.field_value`) ?? '')}
                    onChange={(e) =>
                      form.setValue(`actions.${index}.config.field_value`, e.target.value)
                    }
                  />
                </div>
              )}

              {actionType === 'create_task' && (
                <div className="space-y-3">
                  <Input
                    label="Título de la tarea"
                    placeholder="Ej: Dar seguimiento al lead"
                    value={String(form.getValues(`actions.${index}.config.title`) ?? '')}
                    onChange={(e) => form.setValue(`actions.${index}.config.title`, e.target.value)}
                  />
                </div>
              )}

              {actionType === 'send_webhook' && (
                <div className="space-y-3">
                  <Input
                    label="URL del webhook"
                    placeholder="https://..."
                    value={String(form.getValues(`actions.${index}.config.url`) ?? '')}
                    onChange={(e) => form.setValue(`actions.${index}.config.url`, e.target.value)}
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
        <Icon name="Plus" size={13} />
        Agregar acción
      </Button>
    </SectionCard>
  );
}

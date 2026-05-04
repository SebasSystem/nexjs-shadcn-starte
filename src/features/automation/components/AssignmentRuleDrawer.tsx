'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { MOCK_AUTOMATION_USERS } from 'src/_mock/_automation';
import { cn } from 'src/lib/utils';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { Textarea } from 'src/shared/components/ui/textarea';

import type { AssignmentRuleFormData } from '../schemas/assignment-rule.schema';
import { assignmentRuleSchema } from '../schemas/assignment-rule.schema';
import type { AssignmentRule, AssignmentRuleType } from '../types';
import { ASSIGNMENT_RULE_TYPE_LABELS } from '../types';

const TYPE_OPTIONS = (Object.keys(ASSIGNMENT_RULE_TYPE_LABELS) as AssignmentRuleType[]).map(
  (key) => ({
    value: key,
    label: ASSIGNMENT_RULE_TYPE_LABELS[key],
  })
);

const GEO_COUNTRIES = ['Colombia', 'México', 'Argentina', 'Perú', 'Chile', 'default'];

interface AssignmentRuleDrawerProps {
  open: boolean;
  item: AssignmentRule | null;
  onClose: () => void;
  onCreate: (rule: Omit<AssignmentRule, 'id' | 'createdAt' | 'roundRobinIndex'>) => void;
  onUpdate: (id: string, updates: Partial<AssignmentRule>) => void;
}

export function AssignmentRuleDrawer({
  open,
  item,
  onClose,
  onCreate,
  onUpdate,
}: AssignmentRuleDrawerProps) {
  const isEditing = !!item;

  const form = useForm<AssignmentRuleFormData>({
    resolver: zodResolver(assignmentRuleSchema),
    defaultValues: {
      name: '',
      type: 'round_robin',
      description: '',
      userIds: [],
      geoMapping: {},
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        type: item.type,
        description: item.description ?? '',
        userIds: item.userIds,
        geoMapping: item.geoMapping ?? {},
      });
    } else {
      form.reset({
        name: '',
        type: 'round_robin',
        description: '',
        userIds: [],
        geoMapping: {},
      });
    }
  }, [item, form]);

  const watchedType = useWatch({ control: form.control, name: 'type' });
  const watchedUserIds = useWatch({ control: form.control, name: 'userIds' });
  const watchedGeoMapping = useWatch({ control: form.control, name: 'geoMapping' });

  const toggleUser = (userId: string) => {
    const current = watchedUserIds;
    const next = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    form.setValue('userIds', next);
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (isEditing && item) {
      onUpdate(item.id, {
        name: data.name,
        type: data.type,
        description: data.description,
        userIds: data.userIds,
        geoMapping: data.geoMapping,
      });
    } else {
      onCreate({
        name: data.name,
        type: data.type,
        description: data.description,
        userIds: data.userIds,
        geoMapping: data.geoMapping,
        enabled: true,
      });
    }
    onClose();
  });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <SheetTitle>
            {isEditing ? 'Editar regla de asignación' : 'Nueva regla de asignación'}
          </SheetTitle>
          <SheetDescription>
            Configurá cómo se asignan automáticamente los leads a los vendedores.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
          <Input
            label="Nombre"
            required
            placeholder="Ej: Asignación Social Media"
            error={form.formState.errors.name?.message}
            {...form.register('name')}
          />

          <SelectField
            label="Tipo"
            options={TYPE_OPTIONS}
            value={watchedType}
            onChange={(v) => form.setValue('type', v as AssignmentRuleType)}
          />

          <Textarea
            label="Descripción (opcional)"
            placeholder="Describí el propósito de esta regla..."
            rows={3}
            {...form.register('description')}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Usuarios asignables</p>
            <div className="space-y-2">
              {MOCK_AUTOMATION_USERS.map((user) => (
                <label
                  key={user.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
                    watchedUserIds.includes(user.id)
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/50 hover:border-border'
                  )}
                >
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={watchedUserIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          {watchedType === 'geographic' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Mapeo geográfico</p>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">
                        País / Región
                      </th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-muted-foreground">
                        Asignar a
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {GEO_COUNTRIES.map((country) => {
                      const geoMapping = watchedGeoMapping ?? {};
                      const currentUser = geoMapping[country]?.[0] ?? '';
                      return (
                        <tr key={country} className="border-b border-border/30 last:border-0">
                          <td className="px-3 py-2 font-medium text-foreground">{country}</td>
                          <td className="px-3 py-2">
                            <SelectField
                              options={[
                                { value: '', label: 'Sin asignar' },
                                ...MOCK_AUTOMATION_USERS.map((u) => ({
                                  value: u.id,
                                  label: u.name,
                                })),
                              ]}
                              value={currentUser}
                              onChange={(v) => {
                                const current = watchedGeoMapping ?? {};
                                form.setValue('geoMapping', {
                                  ...current,
                                  [country]: v ? [v as string] : [],
                                });
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border/40 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button color="primary" onClick={handleSubmit} className="flex-1">
            {isEditing ? 'Guardar cambios' : 'Crear regla'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { cn } from 'src/lib/utils';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
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
import { Switch } from 'src/shared/components/ui/switch';
import { Textarea } from 'src/shared/components/ui/textarea';

import { useUsers } from '../hooks/useUsers';
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

/**
 * Countries list for geographic assignment rules.
 * TODO: Ideally fetch from `GET /settings/localization/options` or a dedicated
 * countries endpoint. The backend `SettingsController@localizationOptions` already
 * returns locale options (currency, date format, etc.). A `countries` field could
 * be added there. For now, keeping this hardcoded is acceptable — the country list
 * rarely changes and the endpoint doesn't yet expose a countries array.
 */
const GEO_COUNTRIES = ['Colombia', 'México', 'Argentina', 'Perú', 'Chile', 'default'];

interface AssignmentRuleDrawerProps {
  open: boolean;
  item: AssignmentRule | null;
  onClose: () => void;
  onCreate: (rule: Omit<AssignmentRule, 'uid' | 'created_at' | 'round_robin_index'>) => void;
  onUpdate: (uid: string, updates: Partial<AssignmentRule>) => void;
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
      user_ids: [],
      geo_mapping: {},
      is_active: true,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        type: item.type,
        description: item.description ?? '',
        user_ids: item.user_ids,
        geo_mapping: item.geo_mapping ?? {},
        is_active: item.is_active ?? true,
      });
    } else {
      form.reset({
        name: '',
        type: 'round_robin',
        description: '',
        user_ids: [],
        geo_mapping: {},
      });
    }
  }, [item, form]);

  const watchedType = useWatch({ control: form.control, name: 'type' });
  const watchedUserIds = useWatch({ control: form.control, name: 'user_ids' });
  const watchedGeoMapping = useWatch({ control: form.control, name: 'geo_mapping' });
  const watchedIsActive = useWatch({ control: form.control, name: 'is_active' });

  const toggleUser = (userId: string) => {
    const current = watchedUserIds;
    const next = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    form.setValue('user_ids', next);
  };

  const [userSearch, setUserSearch] = useState('');

  const { userOptions } = useUsers(userSearch);

  // Derive selected users map from userOptions (no state, no useEffect)
  const selectedUsers = useMemo(() => {
    const map = new Map<string, string>();
    userOptions.forEach((u) => {
      if (watchedUserIds.includes(u.value)) map.set(u.value, u.label);
    });
    return map;
  }, [userOptions, watchedUserIds]);

  const handleSubmit = form.handleSubmit((data) => {
    if (isEditing && item) {
      onUpdate(item.uid, {
        name: data.name,
        type: data.type,
        description: data.description,
        user_ids: data.user_ids,
        geo_mapping: data.geo_mapping,
        is_active: data.is_active ?? true,
      });
    } else {
      onCreate({
        name: data.name,
        type: data.type,
        description: data.description,
        user_ids: data.user_ids,
        geo_mapping: data.geo_mapping,
        is_active: data.is_active ?? true,
      });
    }
    onClose();
  });

  return (
    <Sheet key={item?.uid ?? 'new'} open={open} onOpenChange={(v) => !v && onClose()}>
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

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Activo</span>
            <Switch
              checked={watchedIsActive ?? true}
              onCheckedChange={(v) => form.setValue('is_active', v)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Usuarios asignables</p>
            {/* Selected users as chips */}
            {watchedUserIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {watchedUserIds.map((uid) => (
                  <span
                    key={uid}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {selectedUsers.get(uid) ?? uid}
                    <button type="button" onClick={() => toggleUser(uid)}>
                      <Icon name="X" size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <Input
              placeholder="Buscar usuario..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <div className="space-y-1 max-h-60 overflow-y-auto border border-border rounded-lg">
              {userOptions.map((user) => (
                <label
                  key={user.value}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors hover:bg-muted/50',
                    watchedUserIds.includes(user.value) && 'bg-primary/5'
                  )}
                >
                  <input
                    type="checkbox"
                    className="accent-primary rounded"
                    checked={watchedUserIds.includes(user.value)}
                    onChange={() => toggleUser(user.value)}
                  />
                  <span className="text-sm">{user.label}</span>
                </label>
              ))}
              {userOptions.length === 0 && (
                <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                  Sin resultados
                </p>
              )}
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
                              options={[{ value: '', label: 'Sin asignar' }, ...userOptions]}
                              value={currentUser}
                              onChange={(v) => {
                                const current = watchedGeoMapping ?? {};
                                form.setValue('geo_mapping', {
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

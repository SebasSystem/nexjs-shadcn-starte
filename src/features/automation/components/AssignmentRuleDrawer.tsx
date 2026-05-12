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
import type { AssignmentRule } from '../types';

interface AssignmentRuleDrawerProps {
  open: boolean;
  item: AssignmentRule | null;
  onClose: () => void;
  onCreate: (rule: Omit<AssignmentRule, 'uid' | 'created_at'>) => void;
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
      description: '',
      user_ids: [],
      logic: 'AND',
      is_active: true,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description ?? '',
        user_ids: item.user_ids ?? [],
        logic: (item.logic as 'AND' | 'OR') ?? 'AND',
        is_active: item.is_active ?? true,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        user_ids: [],
        logic: 'AND',
        is_active: true,
      });
    }
  }, [item, form]);

  const watchedUserIds = useWatch({ control: form.control, name: 'user_ids' });
  const watchedIsActive = useWatch({ control: form.control, name: 'is_active' });
  const watchedLogic = useWatch({ control: form.control, name: 'logic' });

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
        description: data.description,
        user_ids: data.user_ids,
        logic: data.logic ?? 'AND',
        is_active: data.is_active ?? true,
      });
    } else {
      onCreate({
        name: data.name,
        description: data.description,
        user_ids: data.user_ids,
        logic: data.logic ?? 'AND',
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

          <Textarea
            label="Descripción (opcional)"
            placeholder="Describí el propósito de esta regla..."
            rows={3}
            {...form.register('description')}
          />

          <SelectField
            label="Lógica"
            options={[
              { value: 'AND', label: 'AND — Todas las condiciones' },
              { value: 'OR', label: 'OR — Al menos una condición' },
            ]}
            value={watchedLogic ?? 'AND'}
            onChange={(v) => form.setValue('logic', v as 'AND' | 'OR')}
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

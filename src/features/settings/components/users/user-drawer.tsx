'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'src/shared/components/ui/button';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import type { SettingsUser, EstadoUsuario } from '../../types/settings.types';
import type { Rol } from '../../types/settings.types';
import type { Equipo } from '../../types/settings.types';

const schema = z.object({
  nombre: z.string().min(2, 'Requerido'),
  email: z.string().email('Email inválido'),
  rolId: z.string().min(1, 'Selecciona un rol'),
  rolNombre: z.string().optional(),
  equipoId: z.string().optional(),
  equipoNombre: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'PENDIENTE']),
});

type UserForm = z.infer<typeof schema>;

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: SettingsUser | null;
  roles: Rol[];
  equipos: Equipo[];
  onSave: (data: Omit<SettingsUser, 'id' | 'creadoEn' | 'ultimoAcceso'>) => Promise<boolean>;
}

const ESTADO_OPTIONS = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'INACTIVO', label: 'Inactivo' },
];

export const UserDrawer: React.FC<UserDrawerProps> = ({
  isOpen,
  onClose,
  user,
  roles,
  equipos,
  onSave,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<UserForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { estado: 'ACTIVO' },
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          nombre: user.nombre,
          email: user.email,
          rolId: user.rolId,
          equipoId: user.equipoId ?? '',
          estado: user.estado,
        });
      } else {
        reset({ nombre: '', email: '', rolId: '', equipoId: '', estado: 'ACTIVO' });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: UserForm) => {
    const rol = roles.find((r) => r.id === data.rolId);
    const equipo = equipos.find((e) => e.id === data.equipoId);
    const success = await onSave({
      nombre: data.nombre,
      email: data.email,
      rolId: data.rolId,
      rolNombre: rol?.nombre ?? '',
      equipoId: data.equipoId || undefined,
      equipoNombre: equipo?.nombre || undefined,
      estado: data.estado as EstadoUsuario,
    });
    if (success) onClose();
  };

  const rolOptions = roles.map((r) => ({ value: r.id, label: r.nombre }));
  const equipoOptions = [
    { value: '', label: 'Sin equipo' },
    ...equipos.map((e) => ({ value: e.id, label: e.nombre })),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[440px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{user ? 'Editar Usuario' : 'Invitar Usuario'}</SheetTitle>
          <SheetDescription>
            {user
              ? 'Actualiza el rol y equipo del usuario'
              : 'Completa los datos del nuevo usuario'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-5">
            <FormInput
              control={control}
              name="nombre"
              label="Nombre completo"
              required
              placeholder="Ej. Carlos Mendoza"
            />

            <FormInput
              control={control}
              name="email"
              type="email"
              label="Email"
              required
              placeholder="carlos@empresa.com"
              disabled={!!user}
            />

            <FormSelectField
              control={control}
              name="rolId"
              label="Rol"
              required
              options={rolOptions}
              placeholder="Seleccionar rol..."
            />

            <FormSelectField
              control={control}
              name="equipoId"
              label="Equipo"
              options={equipoOptions}
            />

            <FormSelectField
              control={control}
              name="estado"
              label="Estado"
              options={ESTADO_OPTIONS}
            />
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : user ? 'Guardar cambios' : 'Invitar usuario'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

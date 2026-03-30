'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'src/shared/components/ui/button';
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

export const UserDrawer: React.FC<UserDrawerProps> = ({
  isOpen,
  onClose,
  user,
  roles,
  equipos,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
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
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nombre completo *</label>
              <input
                {...register('nombre')}
                className={`w-full h-10 px-3 border rounded-md text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej. Carlos Mendoza"
              />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input
                {...register('email')}
                type="email"
                className={`w-full h-10 px-3 border rounded-md text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="carlos@empresa.com"
                disabled={!!user}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Rol *</label>
              <select
                {...register('rolId')}
                className={`w-full h-10 px-3 border rounded-md text-sm bg-white ${errors.rolId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">-- Seleccionar rol --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
              {errors.rolId && <p className="text-xs text-red-500">{errors.rolId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Equipo</label>
              <select
                {...register('equipoId')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="">Sin equipo</option>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <select
                {...register('estado')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="ACTIVO">Activo</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : user ? 'Guardar cambios' : 'Invitar usuario'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

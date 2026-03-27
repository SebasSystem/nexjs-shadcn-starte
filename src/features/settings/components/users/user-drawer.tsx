'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[440px] bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold">{user ? 'Editar Usuario' : 'Invitar Usuario'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {user
                ? 'Actualiza el rol y equipo del usuario'
                : 'Completa los datos del nuevo usuario'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
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
        </form>

        <div className="border-t p-4 shrink-0 flex justify-end gap-3 bg-gray-50">
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
        </div>
      </div>
    </>
  );
};

'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import { cn } from 'src/lib/utils';
import type { Rol, AccionPermiso, PermisoModulo } from '../../types/settings.types';

const MODULOS = [
  { id: 'm1', nombre: 'Inventario' },
  { id: 'm2', nombre: 'Ventas' },
  { id: 'm3', nombre: 'Reportes' },
  { id: 'm4', nombre: 'RH / Comisiones' },
  { id: 'm5', nombre: 'Configuración' },
];

const ACCIONES: AccionPermiso[] = ['ver', 'crear', 'editar', 'eliminar'];

interface RoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rol: Rol | null;
  onSave: (data: Omit<Rol, 'id' | 'creadoEn' | 'totalUsuarios'>) => Promise<boolean>;
}

export const RoleDrawer: React.FC<RoleDrawerProps> = ({ isOpen, onClose, rol, onSave }) => {
  const [nombre, setNombre] = useState(rol?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? '');
  const [permisos, setPermisos] = useState<PermisoModulo[]>(
    rol?.permisos ?? MODULOS.map((m) => ({ moduloId: m.id, moduloNombre: m.nombre, acciones: [] }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAccion = (moduloId: string, accion: AccionPermiso) => {
    setPermisos((prev) =>
      prev.map((p) => {
        if (p.moduloId !== moduloId) return p;
        const tiene = p.acciones.includes(accion);
        let newAcciones = tiene ? p.acciones.filter((a) => a !== accion) : [...p.acciones, accion];
        // "ver" es requerido si hay cualquier otra acción
        if (newAcciones.some((a) => a !== 'ver') && !newAcciones.includes('ver')) {
          newAcciones = ['ver', ...newAcciones];
        }
        return { ...p, acciones: newAcciones };
      })
    );
  };

  const hasAccion = (moduloId: string, accion: AccionPermiso) =>
    permisos.find((p) => p.moduloId === moduloId)?.acciones.includes(accion) ?? false;

  const handleSave = async () => {
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    const success = await onSave({
      nombre,
      descripcion,
      permisos: permisos.filter((p) => p.acciones.length > 0),
      esDefecto: false,
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[520px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{rol ? 'Editar Rol' : 'Nuevo Rol'}</SheetTitle>
          <SheetDescription>Define el nombre y los permisos por módulo</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nombre del rol *</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                placeholder="Ej. Gerente de Zona"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                placeholder="Describe brevemente este rol..."
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">
                Permisos por módulo
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2.5 px-4 font-semibold text-gray-600 w-[40%]">
                        Módulo
                      </th>
                      {ACCIONES.map((a) => (
                        <th
                          key={a}
                          className="text-center py-2.5 px-2 font-semibold text-gray-600 capitalize w-[15%]"
                        >
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULOS.map((modulo, idx) => (
                      <tr
                        key={modulo.id}
                        className={cn(
                          'border-b border-gray-100',
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                        )}
                      >
                        <td className="py-2.5 px-4 font-medium text-gray-800">{modulo.nombre}</td>
                        {ACCIONES.map((accion) => (
                          <td key={accion} className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleAccion(modulo.id, accion)}
                              className={cn(
                                'w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-colors',
                                hasAccion(modulo.id, accion)
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-gray-300 bg-white hover:border-blue-400'
                              )}
                            >
                              {hasAccion(modulo.id, accion) && <Check size={12} strokeWidth={3} />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400">
                * &quot;Ver&quot; se activa automáticamente cuando se asigna cualquier otra acción.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!nombre.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Rol'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

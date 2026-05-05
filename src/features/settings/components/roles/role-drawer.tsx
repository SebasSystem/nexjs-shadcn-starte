'use client';

import React, { useState } from 'react';
import { cn } from 'src/lib/utils';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { Textarea } from 'src/shared/components/ui/textarea';

import type { ModulePermission, PermissionAction, Role } from '../../types/settings.types';

const MODULES = [
  { id: 'm1', name: 'Inventario' },
  { id: 'm2', name: 'Ventas' },
  { id: 'm3', name: 'Reportes' },
  { id: 'm4', name: 'RH / Comisiones' },
  { id: 'm5', name: 'Configuración' },
];

const ACTIONS: PermissionAction[] = ['ver', 'crear', 'editar', 'eliminar'];

interface RoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSave: (data: Omit<Role, 'uid' | 'created_at' | 'total_users'>) => Promise<boolean>;
}

export const RoleDrawer: React.FC<RoleDrawerProps> = ({ isOpen, onClose, role, onSave }) => {
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [permissions, setPermissions] = useState<ModulePermission[]>(
    role?.permissions ??
      MODULES.map((m) => ({ module_uid: m.id, module_name: m.name, actions: [] }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAction = (moduleUid: string, action: PermissionAction) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.module_uid !== moduleUid) return p;
        const has = p.actions.includes(action);
        let newActions = has ? p.actions.filter((a) => a !== action) : [...p.actions, action];
        if (newActions.some((a) => a !== 'ver') && !newActions.includes('ver')) {
          newActions = ['ver', ...newActions];
        }
        return { ...p, actions: newActions };
      })
    );
  };

  const hasAction = (moduleUid: string, action: PermissionAction) =>
    permissions.find((p) => p.module_uid === moduleUid)?.actions.includes(action) ?? false;

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    const success = await onSave({
      name,
      description,
      permissions: permissions.filter((p) => p.actions.length > 0),
      is_default: false,
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[520px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{role ? 'Editar Rol' : 'Nuevo Rol'}</SheetTitle>
          <SheetDescription>Define el nombre y los permisos por módulo</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-6">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              label="Nombre del rol"
              required
              placeholder="Ej. Gerente de Zona"
            />

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              label="Descripción"
              rows={2}
              placeholder="Describe brevemente este rol..."
            />

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                Permisos por módulo
              </h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left py-2.5 px-4 font-semibold text-foreground w-[40%]">
                        Módulo
                      </th>
                      {ACTIONS.map((a) => (
                        <th
                          key={a}
                          className="text-center py-2.5 px-2 font-semibold text-foreground capitalize w-[15%]"
                        >
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((modulo, idx) => (
                      <tr
                        key={modulo.id}
                        className={cn(
                          'border-b border-border/40',
                          idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        )}
                      >
                        <td className="py-2.5 px-4 font-medium text-foreground">{modulo.name}</td>
                        {ACTIONS.map((action) => (
                          <td key={action} className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleAction(modulo.id, action)}
                              className={cn(
                                'w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-colors cursor-pointer',
                                hasAction(modulo.id, action)
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-border bg-background hover:border-primary/50'
                              )}
                            >
                              {hasAction(modulo.id, action) && (
                                <Icon name="Check" size={12} strokeWidth={3} />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                * &quot;Ver&quot; se activa automáticamente cuando se asigna cualquier otra acción.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Rol'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

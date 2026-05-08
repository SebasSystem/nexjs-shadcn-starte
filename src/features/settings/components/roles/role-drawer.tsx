'use client';

import React, { useMemo, useState } from 'react';
import { cn } from 'src/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'src/shared/components/ui/accordion';
import { Button } from 'src/shared/components/ui/button';
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

import { usePermissions } from '../../hooks/use-roles';
import type { Permission, Role } from '../../types/settings.types';

type RoleSavePayload = {
  name: string;
  description: string;
  permission_uids: string[];
};

interface RoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSave: (data: RoleSavePayload) => Promise<boolean>;
}

function groupByModule(permissions: Permission[]): Map<string, Permission[]> {
  const groups = new Map<string, Permission[]>();
  for (const p of permissions) {
    const existing = groups.get(p.module);
    if (existing) {
      existing.push(p);
    } else {
      groups.set(p.module, [p]);
    }
  }
  return groups;
}

export const RoleDrawer: React.FC<RoleDrawerProps> = ({ isOpen, onClose, role, onSave }) => {
  const { data: permissions = [], isLoading: isLoadingPerms } = usePermissions();

  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [selectedUids, setSelectedUids] = useState<string[]>(role?.permission_uids ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-initialize state when the drawer opens for a different role
  React.useEffect(() => {
    if (isOpen) {
      setName(role?.name ?? '');
      setDescription(role?.description ?? '');
      setSelectedUids(role?.permission_uids ?? []);
    }
  }, [isOpen, role]);

  const grouped = useMemo(() => groupByModule(permissions), [permissions]);

  const toggleUid = (uid: string) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    const success = await onSave({
      name,
      description,
      permission_uids: selectedUids,
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[520px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{role ? 'Editar Rol' : 'Nuevo Rol'}</SheetTitle>
          <SheetDescription>Define el nombre y los permisos del rol</SheetDescription>
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
                Permisos
              </h3>

              {isLoadingPerms ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted/40 rounded-lg w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Accordion type="multiple" className="border border-border rounded-lg">
                    {[...grouped.entries()].map(([module, modulePerms]) => {
                      const selectedCount = modulePerms.filter((p) =>
                        selectedUids.includes(p.uid)
                      ).length;
                      const totalCount = modulePerms.length;

                      return (
                        <AccordionItem key={module} value={module}>
                          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/30">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">{module}</span>
                              <span
                                className={cn(
                                  'text-xs rounded-full px-2 py-0.5',
                                  selectedCount > 0
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {selectedCount}/{totalCount}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4">
                            <div className="space-y-2">
                              {modulePerms.map((perm) => {
                                const isChecked = selectedUids.includes(perm.uid);

                                return (
                                  <label
                                    key={perm.uid}
                                    className={cn(
                                      'flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors',
                                      isChecked ? 'bg-primary/5' : 'hover:bg-muted/30'
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleUid(perm.uid)}
                                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-medium text-foreground capitalize">
                                        {perm.action}
                                      </span>
                                      {perm.description && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {perm.description}
                                        </p>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  <p className="text-xs text-muted-foreground">
                    {selectedUids.length} permiso
                    {selectedUids.length !== 1 ? 's' : ''} seleccionado
                    {selectedUids.length !== 1 ? 's' : ''}
                  </p>
                </>
              )}
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
            disabled={!name.trim() || isSubmitting || isLoadingPerms}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Rol'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

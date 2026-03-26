'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import { Button } from 'src/shared/components/ui/button';
import { Switch } from 'src/shared/components/ui/switch';
import { Alerta } from 'src/features/admin/types/admin.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface AlertasDrawerProps {
  alerta: Alerta | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Alerta, 'id'>) => Promise<void>;
}

type Canal = 'EMAIL' | 'SLACK' | 'PUSH';

export function AlertasDrawer({ alerta, isOpen, onClose, onSave }: AlertasDrawerProps) {
  const isEditing = !!alerta;
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    condicion: '',
    canal: [] as Canal[],
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  });

  useEffect(() => {
    if (alerta) {
      setForm({
        nombre: alerta.nombre,
        condicion: alerta.condicion,
        canal: alerta.canal,
        estado: alerta.estado,
      });
    } else {
      setForm({
        nombre: '',
        condicion: '',
        canal: ['EMAIL'],
        estado: 'ACTIVO',
      });
    }
  }, [alerta, isOpen]);

  const toggleCanal = (c: Canal) => {
    setForm((prev) => ({
      ...prev,
      canal: prev.canal.includes(c) ? prev.canal.filter((x) => x !== c) : [...prev.canal, c],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await delay(800);
      await onSave({
        nombre: form.nombre,
        condicion: form.condicion,
        canal: form.canal,
        estado: form.estado,
        ultimaActivacion: alerta?.ultimaActivacion ?? null,
      });
      toast.success(isEditing ? 'Alerta actualizada.' : 'Alerta creada correctamente.');
      onClose();
    } catch {
      toast.error('Error al procesar. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border/40">
          <SheetTitle>{isEditing ? 'Editar Alerta' : 'Nueva Alerta'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica la configuración de la alerta'
              : 'Configura una nueva regla de alerta'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-caption font-medium text-muted-foreground mb-1">
              Nombre de la alerta *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Errores críticos por hora"
            />
          </div>

          <div>
            <label className="block text-caption font-medium text-muted-foreground mb-1">
              Condición
            </label>
            <input
              type="text"
              value={form.condicion}
              onChange={(e) => setForm({ ...form, condicion: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Si errores > 50 en 1h"
            />
          </div>

          <div>
            <label className="block text-caption font-medium text-muted-foreground mb-2">
              Canal de notificación
            </label>
            <div className="space-y-2">
              {(['EMAIL', 'SLACK', 'PUSH'] as Canal[]).map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 text-body2 text-foreground cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.canal.includes(c)}
                    onChange={() => toggleCanal(c)}
                    className="rounded"
                  />
                  {c === 'EMAIL'
                    ? 'Email'
                    : c === 'SLACK'
                      ? 'Slack (webhook)'
                      : 'Push notification'}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-body2 font-medium text-foreground">Estado</p>
              <p className="text-caption text-muted-foreground">Activar o desactivar esta alerta</p>
            </div>
            <Switch
              checked={form.estado === 'ACTIVO'}
              onCheckedChange={(checked) =>
                setForm({ ...form, estado: checked ? 'ACTIVO' : 'INACTIVO' })
              }
            />
          </div>
        </div>

        <SheetFooter className="border-t border-border/40 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !form.nombre}>
            {isSaving ? 'Guardando...' : 'Guardar Alerta'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

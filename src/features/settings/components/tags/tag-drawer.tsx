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

import type { Tag, TagColor, TagEntity, TagForm } from '../../types/tags.types';
import { BadgeColorMap } from './tags-table';

const COLORS: { value: TagColor; label: string }[] = [
  { value: 'blue', label: 'Azul' },
  { value: 'red', label: 'Rojo' },
  { value: 'green', label: 'Verde' },
  { value: 'yellow', label: 'Amarillo' },
  { value: 'purple', label: 'Morado' },
  { value: 'orange', label: 'Naranja' },
  { value: 'slate', label: 'Gris' },
  { value: 'pink', label: 'Rosa' },
];

const ENTITIES: { value: TagEntity; label: string }[] = [
  { value: 'CONTACT', label: 'Contactos' },
  { value: 'COMPANY', label: 'Empresas' },
  { value: 'LEAD', label: 'Prospectos' },
  { value: 'DEAL', label: 'Negocios' },
];

interface TagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tag: Tag | null;
  onSave: (form: TagForm) => Promise<boolean>;
}

export const TagDrawer: React.FC<TagDrawerProps> = ({ isOpen, onClose, tag, onSave }) => {
  const [nombre, setNombre] = useState(tag?.nombre ?? '');
  const [color, setColor] = useState<TagColor>(tag?.color ?? 'blue');
  const [entidades, setEntidades] = useState<TagEntity[]>(tag?.entidades ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleEntity = (entity: TagEntity) => {
    setEntidades((prev) =>
      prev.includes(entity) ? prev.filter((e) => e !== entity) : [...prev, entity]
    );
  };

  const handleSave = async () => {
    if (!nombre.trim() || entidades.length === 0) return;
    setIsSubmitting(true);
    const success = await onSave({ nombre, color, entidades });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[440px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{tag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}</SheetTitle>
          <SheetDescription>
            Personaliza el color y en qué módulos estará disponible.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-6">
          <Input
            label="Nombre de la etiqueta"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. VIP, Lista Negra, Referido..."
          />

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Color visual *</p>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                    BadgeColorMap[c.value],
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'opacity-70 hover:opacity-100'
                  )}
                  title={c.label}
                >
                  {color === c.value && <Icon name="Check" size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Aplicable en módulos *</p>
            <div className="grid grid-cols-2 gap-3">
              {ENTITIES.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => toggleEntity(e.value)}
                  className={cn(
                    'px-3 py-2 text-sm rounded-lg border flex items-center gap-2 transition-colors',
                    entidades.includes(e.value)
                      ? 'bg-primary/10 border-primary text-primary font-medium'
                      : 'bg-transparent border-border hover:bg-muted text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-sm border flex items-center justify-center',
                      entidades.includes(e.value)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {entidades.includes(e.value) && <Icon name="Check" size={12} />}
                  </div>
                  {e.label}
                </button>
              ))}
            </div>
            {entidades.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Selecciona al menos un módulo.</p>
            )}
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border/40 bg-muted/10">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="primary"
            onClick={handleSave}
            disabled={!nombre.trim() || entidades.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Etiqueta'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

'use client';

import React, { useState } from 'react';
import { Button } from 'src/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import { Input } from 'src/shared/components/ui/input';
import { Icon } from 'src/shared/components/ui/icon';
import type { Segment, SegmentForm, Rule, FieldType, Operator } from '../../types/segments.types';

const FIELDS: { value: FieldType; label: string }[] = [
  { value: 'tipo', label: 'Tipo de Entidad' },
  { value: 'etiqueta', label: 'Etiqueta Visual' },
  { value: 'estado', label: 'Estado del Cliente' },
  { value: 'fecha_creacion', label: 'Fecha de Creación' },
];

const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'equals', label: 'Es igual a' },
  { value: 'not_equals', label: 'No es igual a' },
  { value: 'contains', label: 'Contiene' },
  { value: 'greater_than', label: 'Es Mayor que' },
  { value: 'less_than', label: 'Es Menor que' },
];

interface SegmentBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  segment: Segment | null;
  onSave: (form: SegmentForm) => Promise<boolean>;
}

export const SegmentBuilderDrawer: React.FC<SegmentBuilderDrawerProps> = ({
  isOpen,
  onClose,
  segment,
  onSave,
}) => {
  const [nombre, setNombre] = useState(segment?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(segment?.descripcion ?? '');
  const [logica, setLogica] = useState<'AND' | 'OR'>(segment?.logica ?? 'AND');
  const [reglas, setReglas] = useState<Rule[]>(
    () =>
      segment?.reglas ?? [
        { id: Math.random().toString(), field: 'etiqueta', operator: 'contains', value: '' },
      ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addRule = () => {
    setReglas((prev) => [
      ...prev,
      { id: Math.random().toString(), field: 'estado', operator: 'equals', value: '' },
    ]);
  };

  const removeRule = (id: string) => {
    setReglas((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, field: keyof Rule, val: string | number | boolean | string[]) => {
    setReglas((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const handleSave = async () => {
    if (!nombre.trim() || reglas.length === 0) return;
    setIsSubmitting(true);
    const success = await onSave({ nombre, descripcion, reglas, logica });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[700px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{segment ? 'Editar Segmento' : 'Crear Segmento Dinámico'}</SheetTitle>
          <SheetDescription>
            Construye consultas avanzadas combinando reglas para segmentar tu cartera al instante.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-foreground">Nombre del Segmento *</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Clientes VIP sin compras"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                placeholder="Opcional. Describe la finalidad de este segmento."
                className="w-full text-sm flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="SplitSquareVertical" className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Reglas de Búsqueda</h3>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
                <button
                  onClick={() => setLogica('AND')}
                  className={`px-3 py-1 text-xs font-bold rounded ${
                    logica === 'AND'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  AND (Y)
                </button>
                <button
                  onClick={() => setLogica('OR')}
                  className={`px-3 py-1 text-xs font-bold rounded ${
                    logica === 'OR'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  OR (O)
                </button>
              </div>
            </div>

            <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
              {reglas.map((regla, index) => (
                <div key={regla.id} className="flex flex-col relative">
                  {index > 0 && (
                    <div className="absolute -top-7 left-4 h-6 w-px bg-border/80 flex items-center justify-center">
                      <span
                        className={`text-[9px] font-bold px-1 rounded-sm -ml-3 mt-4 ${logica === 'AND' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}
                      >
                        {logica}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border shadow-sm z-10">
                    <select
                      className="h-9 w-1/3 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={regla.field}
                      onChange={(e) => updateRule(regla.id, 'field', e.target.value)}
                    >
                      {FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="h-9 w-1/3 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={regla.operator}
                      onChange={(e) => updateRule(regla.id, 'operator', e.target.value)}
                    >
                      {OPERATORS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>

                    <Input
                      className="h-9 flex-1"
                      placeholder="Valor a buscar..."
                      value={regla.value}
                      onChange={(e) => updateRule(regla.id, 'value', e.target.value)}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      onClick={() => removeRule(regla.id)}
                      disabled={reglas.length === 1}
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full border-dashed border-2 bg-transparent text-muted-foreground font-semibold gap-2 hover:bg-muted/40 hover:text-foreground"
                onClick={addRule}
              >
                <Icon name="PlusCircle" className="h-4 w-4" />
                Agregar Condición
              </Button>
            </div>
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
            disabled={!nombre.trim() || reglas.length === 0 || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? 'Guardando Segmento...' : 'Extraer DB y Guardar Segmento'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

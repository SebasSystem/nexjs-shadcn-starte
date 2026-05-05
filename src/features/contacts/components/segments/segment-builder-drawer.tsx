'use client';

import React, { useState } from 'react';
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
import { Textarea } from 'src/shared/components/ui/textarea';

import type { Segment, SegmentPayload, SegmentRule } from '../../types/segments.types';
import { SEGMENT_FIELDS } from '../../types/segments.types';

const OPERATORS: { value: string; label: string }[] = [
  { value: 'equals', label: 'Es igual a' },
  { value: 'not_equals', label: 'No es igual a' },
  { value: 'contains', label: 'Contiene' },
  { value: 'greater_than', label: 'Es Mayor que' },
  { value: 'less_than', label: 'Es Menor que' },
  { value: 'in', label: 'Está en' },
  { value: 'not_in', label: 'No está en' },
];

interface SegmentBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  segment: Segment | null;
  onSave: (payload: SegmentPayload) => Promise<boolean>;
}

export const SegmentBuilderDrawer: React.FC<SegmentBuilderDrawerProps> = ({
  isOpen,
  onClose,
  segment,
  onSave,
}) => {
  const [name, setName] = useState(segment?.name ?? '');
  const [description, setDescription] = useState(segment?.description ?? '');
  const [logic, setLogic] = useState<'AND' | 'OR'>(segment?.logic ?? 'AND');
  const [rules, setRules] = useState<SegmentRule[]>(
    () =>
      segment?.rules ?? [
        {
          uid: Math.random().toString(),
          field: 'status',
          operator: 'contains',
          value: '',
        },
      ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      {
        uid: Math.random().toString(),
        field: 'status',
        operator: 'equals',
        value: '',
      },
    ]);
  };

  const removeRule = (uid: string) => {
    setRules((prev) => prev.filter((r) => r.uid !== uid));
  };

  const updateRule = (
    uid: string,
    field: keyof SegmentRule,
    val: string | number | boolean | string[]
  ) => {
    setRules((prev) => prev.map((r) => (r.uid === uid ? { ...r, [field]: val } : r)));
  };

  const handleSave = async () => {
    if (!name.trim() || rules.length === 0) return;
    setIsSubmitting(true);
    const payload: SegmentPayload = {
      name,
      description,
      logic,
      rules: rules.map(({ uid: _uid, ...rest }) => rest),
    };
    const success = await onSave(payload);
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
            <div className="col-span-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Nombre del Segmento"
                required
                placeholder="Ej. Clientes VIP sin compras"
              />
            </div>
            <div className="col-span-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="Descripción"
                rows={2}
                placeholder="Opcional. Describe la finalidad de este segmento."
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
                  onClick={() => setLogic('AND')}
                  className={`px-3 py-1 text-xs font-bold rounded ${
                    logic === 'AND'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  AND (Y)
                </button>
                <button
                  onClick={() => setLogic('OR')}
                  className={`px-3 py-1 text-xs font-bold rounded ${
                    logic === 'OR'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  OR (O)
                </button>
              </div>
            </div>

            <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
              {rules.map((regla, index) => (
                <div key={regla.uid} className="flex flex-col relative">
                  {index > 0 && (
                    <div className="absolute -top-7 left-4 h-6 w-px bg-border/80 flex items-center justify-center">
                      <span
                        className={`text-[9px] font-bold px-1 rounded-sm -ml-3 mt-4 ${logic === 'AND' ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-700'}`}
                      >
                        {logic}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border shadow-sm z-10">
                    <div className="w-1/3">
                      <SelectField
                        options={SEGMENT_FIELDS}
                        value={regla.field}
                        onChange={(val) => updateRule(regla.uid, 'field', val as string)}
                      />
                    </div>
                    <div className="w-1/3">
                      <SelectField
                        options={OPERATORS}
                        value={regla.operator}
                        onChange={(val) => updateRule(regla.uid, 'operator', val as string)}
                      />
                    </div>
                    <Input
                      className="flex-1"
                      placeholder="Valor a buscar..."
                      value={regla.value}
                      onChange={(e) => updateRule(regla.uid, 'value', e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => removeRule(regla.uid)}
                      disabled={rules.length === 1}
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
            disabled={!name.trim() || rules.length === 0 || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? 'Guardando Segmento...' : 'Extraer DB y Guardar Segmento'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

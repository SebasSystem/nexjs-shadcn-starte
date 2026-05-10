'use client';

import { useState } from 'react';
import type { PipelineStage } from 'src/features/sales/types/sales.types';
import { Button } from 'src/shared/components/ui/button';
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

// ─── Minimal creation payload — matches backend POST opportunity ──────────────
export interface NewOpportunityPayload {
  title: string;
  amount?: number;
  expected_close_date?: string;
  stage_uid?: string;
  description?: string;
  currency?: string;
  opportunityable_type?: string;
  opportunityable_uid?: string;
}

interface NewOpportunityDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NewOpportunityPayload) => void;
  stages: PipelineStage[];
}

export function NewOpportunityDrawer({ open, onClose, onSave, stages }: NewOpportunityDrawerProps) {
  const activeStages = stages.filter((s) => s.is_active && !s.is_won && !s.is_lost);
  const defaultStageUid = activeStages[0]?.uid ?? '';

  const [form, setForm] = useState({
    title: '',
    amount: '',
    stage_uid: defaultStageUid,
    expected_close_date: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stageOptions = activeStages.map((s) => ({
    value: s.uid,
    label: s.name,
  }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'El nombre es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const defaultCloseDate = new Date();
    defaultCloseDate.setDate(defaultCloseDate.getDate() + 30);

    onSave({
      title: form.title.trim(),
      amount: Number(form.amount) || 0,
      expected_close_date: form.expected_close_date || defaultCloseDate.toISOString().split('T')[0],
      stage_uid: form.stage_uid || activeStages[0]?.uid,
      description: form.description.trim() || undefined,
    });

    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[540px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <SheetTitle className="text-h6">Crear Nuevo Lead u Oportunidad</SheetTitle>
          <SheetDescription>
            Registra una nueva posibilidad de venta en tu pipeline comercial.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                  1
                </span>
                Información del Lead
              </h3>

              <Input
                label="Nombre del Cliente o Empresa"
                required
                placeholder="Ej: John Doe / TechNova S.A."
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                error={errors.title}
                autoFocus
              />
            </div>

            <hr className="border-border/40" />

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                  2
                </span>
                Interés y Contexto
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Etapa Inicial"
                  required
                  options={stageOptions}
                  value={form.stage_uid}
                  onChange={(v) => setForm((p) => ({ ...p, stage_uid: v as string }))}
                />
                <Input
                  label="Monto Estimado (Opcional)"
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  leftIcon={<span className="text-sm text-muted-foreground">$</span>}
                />
              </div>

              <Input
                label="Fecha esperada de cierre (Opcional)"
                type="date"
                value={form.expected_close_date}
                onChange={(e) => setForm((p) => ({ ...p, expected_close_date: e.target.value }))}
              />

              <Textarea
                label="Notas / Descripción (Opcional)"
                placeholder="Ej: Nos escribió por Instagram preguntando por licencias..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="bg-muted/30 focus:bg-background transition-colors pt-2"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border/40 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button color="primary" onClick={handleSubmit} className="flex-1">
            Guardar Lead
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { useState } from 'react';
import { PIPELINE_STAGES } from 'src/_mock/_sales';
import type { LeadSource, Opportunity, StageId } from 'src/features/sales/types/sales.types';
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

type NewOpportunityData = Omit<
  Opportunity,
  'id' | 'createdAt' | 'stageEnteredAt' | 'stageHistory' | 'checklist' | 'lostReason'
>;

interface NewOpportunityDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NewOpportunityData) => void;
}

const STAGE_OPTIONS = PIPELINE_STAGES.filter((s) => s.id !== 'cerrado').map((s) => ({
  value: s.id,
  label: s.label,
}));

const ORIGIN_OPTIONS = [
  { value: 'Web', label: 'Sitio Web' },
  { value: 'Facebook Ads', label: 'Facebook Ads' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Referido', label: 'Referido' },
  { value: 'Evento', label: 'Evento / Conferencia' },
  { value: 'Email', label: 'Campaña de Email' },
  { value: 'Otro', label: 'Otro' },
];

const MAIN_PRODUCTS = [
  { value: 'Licencias ERP', label: 'Licencias ERP' },
  { value: 'Implementación', label: 'Servicio de Implementación' },
  { value: 'Infraestructura Cloud', label: 'Infraestructura Cloud' },
  { value: 'Consultoría Estratégica', label: 'Consultoría Estratégica' },
  { value: 'Soporte Técnico', label: 'Soporte Técnico Anual' },
  { value: 'Otro', label: 'Otro' },
];

export function NewOpportunityDrawer({ open, onClose, onSave }: NewOpportunityDrawerProps) {
  const [form, setForm] = useState({
    clientName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    estimatedAmount: '',
    stage: 'leads' as StageId,
    source: 'Web' as LeadSource,
    mainProduct: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.clientName.trim()) newErrors.clientName = 'El nombre es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Default expected close: automatically 30 days from now since it's a cold lead.
    const defaultCloseDate = new Date();
    defaultCloseDate.setDate(defaultCloseDate.getDate() + 30);

    onSave({
      clientName: form.clientName.trim(),
      contactName: form.contactName.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      estimatedAmount: Number(form.estimatedAmount) || 0,
      expectedCloseDate: defaultCloseDate.toISOString().split('T')[0],
      stage: form.stage,
      quotationId: null,
      source: form.source,
      mainProduct: form.mainProduct || undefined,
      owner: 'Administrador', // Mock de usuario actual
      activities: [],
      notes: form.notes
        ? [
            {
              id: `note-${crypto.randomUUID().split('-')[0]}`,
              content: form.notes,
              author: 'Administrador',
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    });

    // Reset
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setForm({
      clientName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      estimatedAmount: '',
      stage: 'leads',
      source: 'Web',
      mainProduct: '',
      notes: '',
    });
    setErrors({});
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && (handleReset(), onClose())}>
      <SheetContent side="right" className="sm:max-w-[540px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <SheetTitle className="text-h6">Crear Nuevo Lead u Oportunidad</SheetTitle>
          <SheetDescription>
            Registra una nueva posibilidad de venta en tu pipeline comercial.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-8">
            {/* Cliente */}
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
                value={form.clientName}
                onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                error={errors.clientName}
                autoFocus
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Teléfono (Opcional)"
                  placeholder="+34 600..."
                  value={form.contactPhone}
                  onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                />
                <Input
                  label="Email (Opcional)"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={form.contactEmail}
                  onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                />
              </div>
            </div>

            <hr className="border-border/40" />

            {/* Oportunidad */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                  2
                </span>
                Interés y Contexto
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Producto de Interés"
                  options={[{ value: '', label: 'Sin especificar' }, ...MAIN_PRODUCTS]}
                  value={form.mainProduct}
                  onChange={(v) => setForm((p) => ({ ...p, mainProduct: v as string }))}
                />
                <SelectField
                  label="Origen del Lead"
                  options={ORIGIN_OPTIONS}
                  value={form.source}
                  onChange={(v) => setForm((p) => ({ ...p, source: v as LeadSource }))}
                />
                <SelectField
                  label="Etapa Inicial"
                  required
                  options={STAGE_OPTIONS}
                  value={form.stage}
                  onChange={(v) => setForm((p) => ({ ...p, stage: v as StageId }))}
                />
                <Input
                  label="Monto Estimado (Opcional)"
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={form.estimatedAmount}
                  onChange={(e) => setForm((p) => ({ ...p, estimatedAmount: e.target.value }))}
                  leftIcon={<span className="text-sm text-muted-foreground">$</span>}
                />
              </div>

              <Textarea
                label="Notas Iniciales (Opcional)"
                placeholder="Ej: Nos escribió por Instagram preguntando por licencias..."
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="bg-muted/30 focus:bg-background transition-colors pt-2"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border/40 shrink-0">
          <Button variant="outline" onClick={() => (handleReset(), onClose())} className="flex-1">
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

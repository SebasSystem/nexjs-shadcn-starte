'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from 'src/shared/components/ui/dialog';
import { Button } from 'src/shared/components/ui/button';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Textarea } from 'src/shared/components/ui/textarea';
import { MOCK_COMPETITORS } from 'src/_mock/_intelligence';
import { LOST_REASON_OPTIONS } from '../config/pipeline.config';
import type { LostReasonInfo } from '../types/sales.types';

const COMPETITOR_OPTIONS = [
  { value: '', label: 'Sin competidor identificado' },
  ...MOCK_COMPETITORS.map((c) => ({ value: c.id, label: c.name })),
];

interface LostReasonDialogProps {
  open: boolean;
  clientName: string;
  onConfirm: (reason: LostReasonInfo) => void;
  onCancel: () => void;
}

const DEFAULT: { category: string; competitorId: string; detail: string } = {
  category: 'price',
  competitorId: '',
  detail: '',
};

export function LostReasonDialog({ open, clientName, onConfirm, onCancel }: LostReasonDialogProps) {
  const [form, setForm] = useState(DEFAULT);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!form.detail.trim()) {
      setError('Agregá un detalle sobre lo que pasó.');
      return;
    }
    const competitor = MOCK_COMPETITORS.find((c) => c.id === form.competitorId);
    onConfirm({
      category: form.category as LostReasonInfo['category'],
      competitorId: form.competitorId || undefined,
      competitorName: competitor?.name,
      detail: form.detail.trim(),
    });
    setForm(DEFAULT);
    setError('');
  };

  const handleCancel = () => {
    setForm(DEFAULT);
    setError('');
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Registrar razón de pérdida</DialogTitle>
          <DialogDescription>
            ¿Por qué se perdió <span className="font-semibold text-foreground">{clientName}</span>?
            Esta información alimenta el análisis competitivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <SelectField
            label="Razón principal *"
            options={LOST_REASON_OPTIONS}
            value={form.category}
            onChange={(v) => setForm((p) => ({ ...p, category: v as string }))}
          />

          <SelectField
            label="Competidor que ganó"
            options={COMPETITOR_OPTIONS}
            value={form.competitorId}
            onChange={(v) => setForm((p) => ({ ...p, competitorId: v as string }))}
            clearable
            placeholder="Sin competidor identificado"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Detalle *</label>
            <Textarea
              placeholder="Contá qué pasó. Cuanto más detalle, mejor para el equipo."
              rows={3}
              value={form.detail}
              onChange={(e) => {
                setForm((p) => ({ ...p, detail: e.target.value }));
                setError('');
              }}
            />
            {error && <p className="text-caption text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button color="error" onClick={handleConfirm}>
            Confirmar pérdida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

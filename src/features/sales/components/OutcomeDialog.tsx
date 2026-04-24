'use client';

import { useState } from 'react';
import { Icon } from 'src/shared/components/ui/icon';
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

type Step = 'outcome' | 'reason';

interface OutcomeDialogProps {
  open: boolean;
  clientName: string;
  onConfirm: (outcome: 'ganado' | 'perdido', lostReason?: LostReasonInfo) => void;
  onCancel: () => void;
}

const COMPETITOR_OPTIONS = [
  { value: '', label: 'Sin competidor identificado' },
  ...MOCK_COMPETITORS.map((c) => ({ value: c.id, label: c.name })),
];

const DEFAULT_REASON = { category: 'price', competitorId: '', detail: '' };

export function OutcomeDialog({ open, clientName, onConfirm, onCancel }: OutcomeDialogProps) {
  const [step, setStep] = useState<Step>('outcome');
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [error, setError] = useState('');

  const reset = () => {
    setStep('outcome');
    setReason(DEFAULT_REASON);
    setError('');
  };

  const handleGanado = () => {
    onConfirm('ganado');
    reset();
  };

  const handlePerdidoConfirm = () => {
    if (!reason.detail.trim()) {
      setError('Agregá un detalle sobre lo que pasó.');
      return;
    }
    const competitor = MOCK_COMPETITORS.find((c) => c.id === reason.competitorId);
    onConfirm('perdido', {
      category: reason.category as LostReasonInfo['category'],
      competitorId: reason.competitorId || undefined,
      competitorName: competitor?.name,
      detail: reason.detail.trim(),
    });
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-[440px]">
        {step === 'outcome' ? (
          <>
            <DialogHeader>
              <DialogTitle>¿Cómo cerró {clientName}?</DialogTitle>
              <DialogDescription>Registrá el resultado de esta oportunidad.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 py-4">
              <button
                onClick={handleGanado}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-success/30 bg-success/5 hover:bg-success/10 hover:border-success/50 transition-all"
              >
                <Icon name="Trophy" size={28} className="text-success" />
                <span className="text-sm font-bold text-success">Ganado</span>
              </button>
              <button
                onClick={() => setStep('reason')}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-destructive/30 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50 transition-all"
              >
                <Icon name="XCircle" size={28} className="text-destructive" />
                <span className="text-sm font-bold text-destructive">Perdido</span>
              </button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} className="w-full">
                Cancelar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Razón de pérdida</DialogTitle>
              <DialogDescription>
                ¿Por qué se perdió{' '}
                <span className="font-semibold text-foreground">{clientName}</span>? Esta
                información alimenta el análisis competitivo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <SelectField
                label="Razón principal *"
                options={LOST_REASON_OPTIONS}
                value={reason.category}
                onChange={(v) => setReason((p) => ({ ...p, category: v as string }))}
              />
              <SelectField
                label="Competidor que ganó"
                options={COMPETITOR_OPTIONS}
                value={reason.competitorId}
                onChange={(v) => setReason((p) => ({ ...p, competitorId: v as string }))}
                clearable
                placeholder="Sin competidor identificado"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Detalle *</label>
                <Textarea
                  placeholder="Contá qué pasó. Cuanto más detalle, mejor para el equipo."
                  rows={3}
                  value={reason.detail}
                  onChange={(e) => {
                    setReason((p) => ({ ...p, detail: e.target.value }));
                    setError('');
                  }}
                />
                {error && <p className="text-caption text-destructive">{error}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('outcome')}>
                Atrás
              </Button>
              <Button color="error" onClick={handlePerdidoConfirm}>
                Confirmar pérdida
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

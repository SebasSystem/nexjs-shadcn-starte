'use client';

import * as React from 'react';
import { Button } from 'src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/shared/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string | React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  variant?: 'error' | 'warning';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description,
  confirmLabel = 'Confirmar',
  loading = false,
  variant = 'error',
}: ConfirmDialogProps) {
  const confirmClassName =
    variant === 'error'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-yellow-500 text-white hover:bg-yellow-600';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription asChild={typeof description !== 'string'}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button className={confirmClassName} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

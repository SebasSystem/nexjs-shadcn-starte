'use client';

import { AlertTriangle } from 'lucide-react';
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
  const isError = variant === 'error';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex shrink-0 size-9 items-center justify-center rounded-full ${
                isError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}
            >
              <AlertTriangle
                className={`size-5 ${isError ? 'text-red-600' : 'text-yellow-500'}`}
              />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="pt-1">{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            className={
              isError
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

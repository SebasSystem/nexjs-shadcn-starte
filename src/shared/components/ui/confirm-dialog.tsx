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
import { Icon } from 'src/shared/components/ui/icon';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string | React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  variant?: 'error' | 'warning' | 'default';
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
  const iconConfig = {
    error: {
      icon: <Icon name="AlertTriangle" size={20} className="text-red-600" />,
      bg: 'bg-red-100 dark:bg-red-900/30',
      btn: 'bg-red-600 text-white hover:bg-red-700',
    },
    warning: {
      icon: <Icon name="AlertTriangle" size={20} className="text-yellow-500" />,
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      btn: 'bg-yellow-500 text-white hover:bg-yellow-600',
    },
    default: {
      icon: <Icon name="AlertCircle" size={20} className="text-primary" />,
      bg: 'bg-primary/10',
      btn: '',
    },
  }[variant ?? 'error'];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex shrink-0 size-9 items-center justify-center rounded-full ${iconConfig.bg}`}
            >
              {iconConfig.icon}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && <DialogDescription className="pt-1">{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            {...(iconConfig.btn ? { className: iconConfig.btn } : { color: 'primary' })}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { cn } from 'src/lib/utils';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { Icon } from 'src/shared/components/ui/icon';

export interface ExportDropdownProps {
  onExport: (format: 'excel' | 'pdf') => void;
  loading?: 'excel' | 'pdf' | null;
  disabled?: boolean;
  className?: string;
}

export function ExportDropdown({
  onExport,
  loading,
  disabled = false,
  className,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || loading !== null}
          className={cn('gap-2', className)}
        >
          {loading ? (
            <>
              <Icon name="Loader2" size={14} className="animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Icon name="Download" size={14} />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => {
            onExport('excel');
            setOpen(false);
          }}
          disabled={loading !== null}
          className="gap-2 cursor-pointer"
        >
          <Icon name="FileSpreadsheet" size={14} className="text-success" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onExport('pdf');
            setOpen(false);
          }}
          disabled={loading !== null}
          className="gap-2 cursor-pointer"
        >
          <Icon name="FileType" size={14} className="text-error" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

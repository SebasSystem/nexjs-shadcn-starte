import React from 'react';
import {
  Button,
  Checkbox,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/shared/components/ui';

export interface ExportColumn {
  id: string;
  label: string;
}

interface FieldSelectorProps {
  columns: ExportColumn[];
  selectedFields: Set<string>;
  onToggleField: (id: string, checked: boolean) => void;
  disabled: boolean;
  onApply: () => void;
}

export function FieldSelector({
  columns,
  selectedFields,
  onToggleField,
  disabled,
  onApply,
}: FieldSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          Personalizar ({selectedFields.size}/{columns.length})
          <Icon name="ChevronUp" size={14} className="ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-56 p-3 mb-2">
        <p className="text-caption font-medium text-foreground mb-3">Columnas a incluir</p>
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {columns.map((col) => {
            const checked = selectedFields.has(col.id);
            return (
              <label
                key={col.id}
                className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/30 p-1.5 rounded-md transition-colors"
              >
                <Checkbox checked={checked} onCheckedChange={(c) => onToggleField(col.id, !!c)} />
                <span className="text-body2 text-foreground font-medium">{col.label}</span>
              </label>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-border/60 text-right">
          <Button size="sm" color="primary" className="w-full" onClick={onApply}>
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

'use client';

import { useState, useId } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Badge } from './badge';
import { cn } from 'src/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectFieldProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  required?: boolean;
  className?: string;
}

export function SelectField({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  label,
  error,
  hint,
  searchable = false,
  multiple = false,
  disabled = false,
  clearable = false,
  required = false,
  className,
}: SelectFieldProps) {
  const generatedId = useId();
  const id = generatedId;
  const listboxId = `${generatedId}-listbox`;
  const [open, setOpen] = useState(false);

  // Normalizar valor a array internamente
  const selected: string[] = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === 'string' && value !== ''
      ? [value]
      : [];

  const toggle = (val: string) => {
    if (multiple) {
      const next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val];
      onChange?.(next);
    } else {
      onChange?.(selected[0] === val ? '' : val);
      setOpen(false);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };

  const getLabel = (val: string) => options.find((o) => o.value === val)?.label ?? val;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-invalid={!!error}
            className={cn(
              'flex min-h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2',
              'text-sm shadow-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-destructive focus-visible:ring-destructive text-destructive'
                : open
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-input hover:border-primary/50 focus-visible:border-primary focus-visible:ring-primary/20'
            )}
          >
            {/* Valores seleccionados */}
            <div className="flex flex-1 flex-wrap gap-1 text-left min-w-0 pr-2 overflow-hidden items-center">
              {multiple && selected.length > 0 ? (
                selected.map((val) => (
                  <Badge key={val} variant="secondary" className="gap-1 pr-1 truncate max-w-full">
                    <span className="truncate">{getLabel(val)}</span>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(val);
                      }}
                      className="rounded-full hover:bg-muted ml-0.5 p-0.5 outline-none cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))
              ) : !multiple && selected[0] ? (
                <span className="truncate block">{getLabel(selected[0])}</span>
              ) : (
                <span className="text-muted-foreground truncate block">{placeholder}</span>
              )}
            </div>

            {/* Acciones derecha */}
            <div className="flex items-center gap-1 shrink-0">
              {clearable && selected.length > 0 && !disabled && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={clear}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground outline-none cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            {searchable && <CommandInput placeholder="Buscar..." className="h-9" />}
            <CommandList id={listboxId}>
              <CommandEmpty>Sin resultados.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    onSelect={() => toggle(opt.value)}
                    className="gap-2 cursor-pointer"
                  >
                    {opt.icon}
                    {opt.label}
                    {selected.includes(opt.value) && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-[0.8rem] font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-[0.8rem] text-muted-foreground">{hint}</p>}
    </div>
  );
}

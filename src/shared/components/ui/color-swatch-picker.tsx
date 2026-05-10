'use client';

import * as React from 'react';
import { cn } from 'src/lib/utils';

import { Icon } from './icon';

export interface SwatchColor {
  value: string;
  label: string;
  /** Tailwind bg class for the swatch dot (e.g. "bg-blue-500") */
  dotClassName: string;
}

interface ColorSwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors: SwatchColor[];
  className?: string;
}

export function ColorSwatchPicker({ value, onChange, colors, className }: ColorSwatchPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2.5', className)}>
      {colors.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          onClick={() => onChange(c.value)}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer',
            c.dotClassName,
            value === c.value
              ? 'ring-2 ring-offset-2 ring-primary scale-110'
              : 'opacity-60 hover:opacity-100 hover:scale-105'
          )}
        >
          {value === c.value && (
            <Icon name="Check" size={14} className="text-white drop-shadow-sm" />
          )}
        </button>
      ))}
    </div>
  );
}

'use client';

import { SectionCard } from 'src/shared/components/layouts/page';
import { Input } from 'src/shared/components/ui/input';
import { SelectField, type SelectOption } from 'src/shared/components/ui/select-field';

import type { TriggerEvent, TriggerSource } from '../types';

interface TriggerBlockProps {
  triggerSource: TriggerSource;
  triggerEvent: TriggerEvent;
  daysThreshold?: number;
  sourceOptions: SelectOption[];
  eventOptions: SelectOption[];
  onSourceChange: (v: TriggerSource) => void;
  onEventChange: (v: TriggerEvent) => void;
  onDaysThresholdChange?: (v: number | undefined) => void;
}

export function TriggerBlock({
  triggerSource,
  triggerEvent,
  daysThreshold,
  sourceOptions,
  eventOptions,
  onSourceChange,
  onEventChange,
  onDaysThresholdChange,
}: TriggerBlockProps) {
  const isTimeBased = triggerSource === 'time';

  return (
    <SectionCard>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
        1. Trigger — ¿Qué evento dispara la regla?
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Fuente"
          options={sourceOptions}
          value={triggerSource}
          onChange={(v) => {
            const src = v as TriggerSource;
            onSourceChange(src);
            // Reset event to first available for the new source
            const firstEvent = eventOptions[0]?.value as TriggerEvent | undefined;
            if (firstEvent) onEventChange(firstEvent);
          }}
        />
        <SelectField
          label="Evento"
          options={eventOptions}
          value={triggerEvent}
          onChange={(v) => onEventChange(v as TriggerEvent)}
        />
        {isTimeBased && (
          <Input
            label="Días (umbral)"
            type="number"
            min={1}
            placeholder="Ej: 14"
            value={daysThreshold ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onDaysThresholdChange?.(val);
            }}
          />
        )}
      </div>
    </SectionCard>
  );
}

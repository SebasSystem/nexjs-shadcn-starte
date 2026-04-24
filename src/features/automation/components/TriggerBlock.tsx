'use client';

import { SectionCard } from 'src/shared/components/layouts/page';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Input } from 'src/shared/components/ui/input';
import { TRIGGER_SOURCE_LABELS, TRIGGER_EVENT_LABELS, TRIGGERS_BY_SOURCE } from '../types';
import type { TriggerSource, TriggerEvent } from '../types';

const SOURCE_OPTIONS = (Object.keys(TRIGGER_SOURCE_LABELS) as TriggerSource[]).map((key) => ({
  value: key,
  label: TRIGGER_SOURCE_LABELS[key],
}));

interface TriggerBlockProps {
  triggerSource: TriggerSource;
  triggerEvent: TriggerEvent;
  daysThreshold?: number;
  onSourceChange: (v: TriggerSource) => void;
  onEventChange: (v: TriggerEvent) => void;
  onDaysThresholdChange?: (v: number | undefined) => void;
}

export function TriggerBlock({
  triggerSource,
  triggerEvent,
  daysThreshold,
  onSourceChange,
  onEventChange,
  onDaysThresholdChange,
}: TriggerBlockProps) {
  const eventOptions = TRIGGERS_BY_SOURCE[triggerSource].map((key) => ({
    value: key,
    label: TRIGGER_EVENT_LABELS[key],
  }));

  const isTimeBased = triggerSource === 'time';

  return (
    <SectionCard>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
        1. Trigger — ¿Qué evento dispara la regla?
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Fuente"
          options={SOURCE_OPTIONS}
          value={triggerSource}
          onChange={(v) => {
            const src = v as TriggerSource;
            onSourceChange(src);
            onEventChange(TRIGGERS_BY_SOURCE[src][0]);
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

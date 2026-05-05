'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';

import type { ContactType } from '../../types/contacts.types';

const TYPE_LABELS: Record<ContactType, string> = {
  company: 'Empresa',
  person: 'Persona',
  government: 'Institución',
};

const TYPES: ContactType[] = ['company', 'person', 'government'];

interface ContactDrawerTypeSelectorProps {
  register: UseFormRegisterReturn<'type'>;
  selected: ContactType;
}

export function ContactDrawerTypeSelector({ register, selected }: ContactDrawerTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Tipo de entidad *</p>
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((t) => {
          const isActive = selected === t;
          return (
            <label
              key={t}
              className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
              }`}
            >
              <input type="radio" {...register} value={t} className="sr-only" />
              <span
                className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t === 'company' ? 'B2B' : t === 'person' ? 'B2C' : 'B2G'}
              </span>
              <span
                className={`text-sm font-medium mt-0.5 ${isActive ? 'text-primary' : 'text-foreground'}`}
              >
                {TYPE_LABELS[t]}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

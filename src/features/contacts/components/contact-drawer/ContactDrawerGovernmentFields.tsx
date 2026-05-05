'use client';

import { type Control, Controller } from 'react-hook-form';
import { Checkbox } from 'src/shared/components/ui/checkbox';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';

import type { ContactDrawerFormData } from './contact-drawer.types';

const INSTITUTION_TYPE_OPTIONS = [
  { value: '', label: 'Seleccionar...' },
  { value: 'Ministerio', label: 'Ministerio' },
  { value: 'Alcaldía', label: 'Alcaldía / Municipio' },
  { value: 'Gobernación', label: 'Gobernación' },
  { value: 'Universidad Pública', label: 'Universidad Pública' },
  { value: 'Hospital Público', label: 'Hospital Público' },
  { value: 'Empresa Pública', label: 'Empresa Pública' },
  { value: 'Otro', label: 'Otro' },
];

interface ContactDrawerGovernmentFieldsProps {
  control: Control<ContactDrawerFormData>;
}

export function ContactDrawerGovernmentFields({ control }: ContactDrawerGovernmentFieldsProps) {
  return (
    <div className="space-y-4 pt-2 border-t border-border/40">
      <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
        Datos de Institución
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <FormSelectField
          control={control}
          name="institution_type"
          label="Tipo de institución"
          options={INSTITUTION_TYPE_OPTIONS}
        />
        <FormInput
          control={control}
          name="bid_code"
          label="Código de Licitación"
          placeholder="LIC-2025-001"
        />
      </div>
      <Controller
        control={control}
        name="is_public_entity"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Checkbox
              id="is_public_entity"
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
            <label htmlFor="is_public_entity" className="text-sm font-medium cursor-pointer">
              Entidad del sector público
            </label>
          </div>
        )}
      />
    </div>
  );
}

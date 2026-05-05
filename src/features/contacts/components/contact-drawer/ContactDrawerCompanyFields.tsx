'use client';

import type { Control } from 'react-hook-form';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';

import type { ContactDrawerFormData } from './contact-drawer.types';

const SIZE_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'micro', label: 'Micro (<10)' },
  { value: 'small', label: 'Pequeña (10-50)' },
  { value: 'medium', label: 'Mediana (50-200)' },
  { value: 'large', label: 'Grande (200+)' },
];

interface ContactDrawerCompanyFieldsProps {
  control: Control<ContactDrawerFormData>;
}

export function ContactDrawerCompanyFields({ control }: ContactDrawerCompanyFieldsProps) {
  return (
    <div className="space-y-4 pt-2 border-t border-border/40">
      <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
        Datos de Empresa
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <FormInput control={control} name="tax_id" label="NIT / RUT" placeholder="900.123.456-7" />
        <FormInput control={control} name="industry" label="Sector" placeholder="Tecnología" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormSelectField
          control={control}
          name="company_size"
          label="Tamaño"
          options={SIZE_OPTIONS}
        />
        <FormInput
          control={control}
          name="website"
          label="Sitio web"
          placeholder="https://empresa.com"
        />
      </div>
    </div>
  );
}

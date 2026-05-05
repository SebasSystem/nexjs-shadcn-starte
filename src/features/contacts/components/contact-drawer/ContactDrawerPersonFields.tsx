'use client';

import type { Control } from 'react-hook-form';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';

import type { Contact } from '../../types/contacts.types';
import type { ContactDrawerFormData } from './contact-drawer.types';

interface ContactDrawerPersonFieldsProps {
  control: Control<ContactDrawerFormData>;
  companies: Contact[];
}

export function ContactDrawerPersonFields({ control, companies }: ContactDrawerPersonFieldsProps) {
  const companyOptions = [
    { value: '', label: 'Sin empresa' },
    ...companies.filter((c) => c.type === 'company').map((c) => ({ value: c.uid, label: c.name })),
  ];

  return (
    <div className="space-y-4 pt-2 border-t border-border/40">
      <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
        Datos de Persona
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={control}
          name="id_number"
          label="Cédula / ID"
          placeholder="12.345.678"
        />
        <FormInput
          control={control}
          name="job_title"
          label="Cargo"
          placeholder="Director Comercial"
        />
      </div>
      <FormSelectField
        control={control}
        name="company_uid"
        label="Empresa vinculada"
        options={companyOptions}
      />
    </div>
  );
}

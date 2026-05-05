'use client';

import type { Control } from 'react-hook-form';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';

import type { ContactDrawerFormData } from './contact-drawer.types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'prospect', label: 'Prospecto' },
  { value: 'inactive', label: 'Inactivo' },
];

interface ContactDrawerBasicInfoProps {
  control: Control<ContactDrawerFormData>;
  type: ContactDrawerFormData['type'];
}

export function ContactDrawerBasicInfo({ control, type }: ContactDrawerBasicInfoProps) {
  return (
    <>
      <FormInput
        control={control}
        name="name"
        label="Nombre"
        required
        placeholder={
          type === 'company'
            ? 'Razón social'
            : type === 'person'
              ? 'Nombre completo'
              : 'Nombre de la institución'
        }
      />

      <FormInput
        control={control}
        name="email"
        type="email"
        label="Email"
        required
        placeholder="correo@ejemplo.com"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput control={control} name="phone" label="Teléfono" placeholder="+57 300 000 0000" />
        <FormSelectField control={control} name="status" label="Estado" options={STATUS_OPTIONS} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput control={control} name="country" label="País" required placeholder="Colombia" />
        <FormInput control={control} name="city" label="Ciudad" placeholder="Bogotá" />
      </div>
    </>
  );
}

'use client';

import React from 'react';
import { Icon } from 'src/shared/components/ui/icon';

import type { Contact } from '../../types/contacts.types';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const SIZE_LABELS: Record<string, string> = {
  micro: 'Micro',
  small: 'Pequeña',
  medium: 'Mediana',
  large: 'Grande',
};

interface ContactDetailInfoProps {
  contacto: Contact;
}

export function ContactDetailInfo({ contacto }: ContactDetailInfoProps) {
  return (
    <div className="space-y-4">
      <InfoRow icon={<Icon name="UserCheck" size={15} />} label="Email" value={contacto.email} />
      {contacto.phone && (
        <InfoRow icon={<Icon name="Phone" size={15} />} label="Teléfono" value={contacto.phone} />
      )}
      <InfoRow
        icon={<Icon name="MapPin" size={15} />}
        label="Ubicación"
        value={`${contacto.city ?? ''}${contacto.city ? ', ' : ''}${contacto.country}`}
      />

      {contacto.type === 'company' && (
        <>
          {contacto.tax_id && (
            <InfoRow
              icon={<Icon name="Building2" size={15} />}
              label="NIT / RUT"
              value={contacto.tax_id}
            />
          )}
          {contacto.industry && (
            <InfoRow
              icon={<Icon name="Building2" size={15} />}
              label="Sector"
              value={contacto.industry}
            />
          )}
          {contacto.company_size && (
            <InfoRow
              icon={<Icon name="Building2" size={15} />}
              label="Tamaño"
              value={SIZE_LABELS[contacto.company_size] ?? contacto.company_size}
            />
          )}
          {contacto.website && (
            <InfoRow
              icon={<Icon name="Globe" size={15} />}
              label="Sitio web"
              value={
                <a
                  href={contacto.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {contacto.website}
                </a>
              }
            />
          )}
        </>
      )}

      {contacto.type === 'person' && (
        <>
          {contacto.id_number && (
            <InfoRow
              icon={<Icon name="UserCheck" size={15} />}
              label="Cédula / ID"
              value={contacto.id_number}
            />
          )}
          {contacto.job_title && (
            <InfoRow
              icon={<Icon name="Building2" size={15} />}
              label="Cargo"
              value={contacto.job_title}
            />
          )}
          {contacto.company_name && (
            <InfoRow
              icon={<Icon name="Building2" size={15} />}
              label="Empresa"
              value={contacto.company_name}
            />
          )}
        </>
      )}

      {contacto.type === 'government' && (
        <>
          {contacto.institution_type && (
            <InfoRow
              icon={<Icon name="Building2" size={15} />}
              label="Tipo"
              value={contacto.institution_type}
            />
          )}
          <InfoRow
            icon={<Icon name="Building2" size={15} />}
            label="Sector público"
            value={contacto.is_public_entity ? 'Sí' : 'No'}
          />
          {contacto.bid_code && (
            <InfoRow
              icon={<Icon name="Building2" size={15} />}
              label="Licitación"
              value={contacto.bid_code}
            />
          )}
        </>
      )}
    </div>
  );
}

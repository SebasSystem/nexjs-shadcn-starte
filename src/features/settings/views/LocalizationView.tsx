'use client';

import React from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';

import { LocalizationForm } from '../components/localization/localization-form';
import { useLocalization } from '../hooks/use-localization';

export const LocalizationView = () => {
  const { config, isLoading, isSaving, saveConfig } = useLocalization();

  return (
    <PageContainer>
      <PageHeader
        title="Localización"
        subtitle="Configura el idioma, zona horaria, moneda y formato de fechas del sistema"
      />

      <SectionCard>
        {isLoading || !config ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-muted/40 rounded-md w-full max-w-xs" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground max-w-lg">
              La <strong>moneda principal</strong> es la base del tenant. El módulo de{' '}
              <em>Multimoneda</em> en ventas permite registrar cotizaciones en otras divisas con
              tasas de cambio configurables.
            </p>
            <LocalizationForm config={config} isSaving={isSaving} onSave={saveConfig} />
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
};

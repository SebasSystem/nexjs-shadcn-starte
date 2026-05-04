'use client';

import React, { useMemo, useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import { CustomFieldDrawer } from '../components/custom-fields/custom-field-drawer';
import { CustomFieldsTable } from '../components/custom-fields/custom-fields-table';
import { useCustomFields } from '../hooks/use-custom-fields';
import type { CampoPersonalizado, ModuloCampo } from '../types/settings.types';

const MODULO_LABELS: Record<ModuloCampo, string> = {
  contactos: 'Contactos',
  empresas: 'Empresas',
  oportunidades: 'Oportunidades',
  productos: 'Productos',
};

const MODULOS = Object.keys(MODULO_LABELS) as ModuloCampo[];

export const CustomFieldsView = () => {
  const { campos, isLoading, createCampo, updateCampo, deleteCampo } = useCustomFields();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCampo, setSelectedCampo] = useState<CampoPersonalizado | null>(null);
  const [filterModulo, setFilterModulo] = useState<ModuloCampo | 'ALL'>('ALL');

  const counts = useMemo(() => {
    const map: Record<ModuloCampo, number> = {
      contactos: 0,
      empresas: 0,
      oportunidades: 0,
      productos: 0,
    };
    campos.forEach((c) => {
      map[c.modulo] = (map[c.modulo] ?? 0) + 1;
    });
    return map;
  }, [campos]);

  const filtered = useMemo(
    () => (filterModulo === 'ALL' ? campos : campos.filter((c) => c.modulo === filterModulo)),
    [campos, filterModulo]
  );

  const handleOpenNew = () => {
    setSelectedCampo(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (campo: CampoPersonalizado) => {
    setSelectedCampo(campo);
    setIsDrawerOpen(true);
  };

  const handleSave = async (data: Omit<CampoPersonalizado, 'id' | 'creadoEn'>) => {
    if (selectedCampo) return updateCampo(selectedCampo.id, data);
    return createCampo(data);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Campos Personalizados"
        subtitle="Agrega campos a medida en los módulos del CRM según tu industria"
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" size={16} />
            Nuevo campo
          </Button>
        }
      />

      {/* Module filter tabs */}
      <div className="flex gap-1 border-b border-border/40">
        <button
          onClick={() => setFilterModulo('ALL')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            filterModulo === 'ALL'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos
          <span
            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              filterModulo === 'ALL'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {campos.length}
          </span>
        </button>
        {MODULOS.map((modulo) => (
          <button
            key={modulo}
            onClick={() => setFilterModulo(modulo)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              filterModulo === modulo
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {MODULO_LABELS[modulo]}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                filterModulo === modulo
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {counts[modulo]}
            </span>
          </button>
        ))}
      </div>

      <SectionCard noPadding>
        {isLoading ? (
          <div className="flex flex-col gap-4 p-5 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : (
          <>
            <CustomFieldsTable
              campos={filtered}
              onEdit={handleEdit}
              onDelete={(c) => deleteCampo(c.id)}
            />
            <div className="border-t border-border/40 p-4 text-sm text-muted-foreground">
              {filtered.length} campo{filtered.length !== 1 ? 's' : ''} personalizado
              {filtered.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </SectionCard>

      <CustomFieldDrawer
        key={isDrawerOpen ? (selectedCampo?.id ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        campo={selectedCampo}
        onSave={handleSave}
      />
    </PageContainer>
  );
};

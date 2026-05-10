'use client';

import React, { useMemo, useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { ConfirmDialog } from 'src/shared/components/ui/confirm-dialog';
import { Icon } from 'src/shared/components/ui/icon';

import { CustomFieldDrawer } from '../components/custom-fields/custom-field-drawer';
import { CustomFieldsTable } from '../components/custom-fields/custom-fields-table';
import { useCustomFields } from '../hooks/use-custom-fields';
import type { CustomField, CustomFieldModule } from '../types/settings.types';

const MODULE_LABELS: Record<CustomFieldModule, string> = {
  contacts: 'Contactos',
  companies: 'Empresas',
  opportunities: 'Oportunidades',
  products: 'Productos',
};

const MODULES = Object.keys(MODULE_LABELS) as CustomFieldModule[];

export const CustomFieldsView = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomField | null>(null);
  const [filterModule, setFilterModule] = useState<CustomFieldModule | 'ALL'>('ALL');

  const { fields, isLoading, createField, updateField, deleteField, pagination } = useCustomFields({
    module: filterModule,
  });

  const counts = useMemo(() => {
    const map: Record<CustomFieldModule, number> = {
      contacts: 0,
      companies: 0,
      opportunities: 0,
      products: 0,
    };
    fields.forEach((f) => {
      map[f.module] = (map[f.module] ?? 0) + 1;
    });
    return map;
  }, [fields]);

  const handleOpenNew = () => {
    setSelectedField(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (field: CustomField) => {
    setSelectedField(field);
    setIsDrawerOpen(true);
  };

  const handleSave = async (data: Omit<CustomField, 'uid' | 'created_at'>) => {
    if (selectedField) return updateField(selectedField.uid, data);
    return createField(data);
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
          onClick={() => setFilterModule('ALL')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            filterModule === 'ALL'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos
          <span
            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              filterModule === 'ALL'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {fields.length}
          </span>
        </button>
        {MODULES.map((mod) => (
          <button
            key={mod}
            onClick={() => setFilterModule(mod)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
              filterModule === mod
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {MODULE_LABELS[mod]}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                filterModule === mod
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {counts[mod]}
            </span>
          </button>
        ))}
      </div>

      <SectionCard noPadding>
        {isLoading && fields.length === 0 ? (
          <div className="flex flex-col gap-4 p-5 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : (
          <>
            <CustomFieldsTable
              fields={fields}
              onEdit={handleEdit}
              onDelete={(f) => setDeleteTarget(f)}
              total={pagination.total}
              pageIndex={pagination.page - 1}
              pageSize={pagination.rowsPerPage}
              onPageChange={(pi: number) => pagination.onChangePage(pi + 1)}
              onPageSizeChange={pagination.onChangeRowsPerPage}
            />
            <div className="border-t border-border/40 p-4 text-sm text-muted-foreground">
              {fields.length} campo{fields.length !== 1 ? 's' : ''} personalizado
              {fields.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </SectionCard>

      <CustomFieldDrawer
        key={isDrawerOpen ? (selectedField?.uid ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        field={selectedField}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteField(deleteTarget.uid);
          setDeleteTarget(null);
        }}
        title="¿Eliminar campo?"
        description={
          <>
            Vas a eliminar <strong>{deleteTarget?.label}</strong>. Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        variant="error"
      />
    </PageContainer>
  );
};

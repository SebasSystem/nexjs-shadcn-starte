'use client';

import React, { useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { ConfirmDialog } from 'src/shared/components/ui/confirm-dialog';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { useDebounce } from 'use-debounce';

import { TagDrawer } from '../components/tags/tag-drawer';
import { TagsTable } from '../components/tags/tags-table';
import { useTags } from '../hooks/use-tags';
import type { Tag, TagForm } from '../types/tags.types';

export const TagsView = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);

  const { tags, isLoading, createTag, updateTag, deleteTag, pagination } = useTags({
    search: debouncedSearch || undefined,
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const handleOpenNew = () => {
    setSelectedTag(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDrawerOpen(true);
  };

  const handleSave = async (form: TagForm): Promise<boolean> => {
    if (selectedTag) return updateTag(selectedTag.uid, form);
    return createTag(form);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Catálogo de Etiquetas"
        subtitle="Gestiona las etiquetas (tags) para categorizar tus clientes, prospectos y negocios."
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Icon name="Plus" size={16} />
            Nueva etiqueta
          </Button>
        }
      />

      <SectionCard noPadding>
        <div className="flex flex-col sm:flex-row gap-3 items-end px-5 py-4">
          <Input
            label="Buscar"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="Search" size={16} />}
            className="flex-1 max-w-sm"
          />
        </div>

        {isLoading && tags.length === 0 ? (
          <div className="p-8 flex flex-col gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Icon name="Tags" size={48} className="text-primary opacity-80" />
            </div>
            <h3 className="text-h6 text-foreground font-semibold mb-2">No hay etiquetas creadas</h3>
            <p className="text-body2 text-muted-foreground max-w-sm mb-6">
              Empieza creando etiquetas como &quot;VIP&quot; o &quot;En riesgo&quot; para clasificar
              tu cartera.
            </p>
            <Button color="primary" onClick={handleOpenNew}>
              Crear primera etiqueta
            </Button>
          </div>
        ) : (
          <TagsTable
            tags={tags}
            onEdit={handleEdit}
            onDelete={(id) => {
              const tag = tags.find((t) => t.uid === id) ?? null;
              setDeleteTarget(tag);
            }}
            total={pagination.total}
            pageIndex={pagination.page - 1}
            pageSize={pagination.rowsPerPage}
            onPageChange={(pi) => pagination.onChangePage(pi + 1)}
            onPageSizeChange={pagination.onChangeRowsPerPage}
          />
        )}
      </SectionCard>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteTag(deleteTarget.uid);
          setDeleteTarget(null);
        }}
        title="¿Eliminar etiqueta?"
        description={
          <>
            Vas a eliminar <strong>{deleteTarget?.name}</strong>. Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        variant="error"
      />

      <TagDrawer
        key={isDrawerOpen ? (selectedTag?.uid ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tag={selectedTag}
        onSave={handleSave}
      />
    </PageContainer>
  );
};

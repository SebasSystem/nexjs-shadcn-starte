'use client';

import React, { useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Plus, Tags as TagsIcon } from 'lucide-react';
import { useTags } from '../hooks/use-tags';
import { TagsTable } from '../components/tags/tags-table';
import { TagDrawer } from '../components/tags/tag-drawer';
import type { Tag, TagForm } from '../types/tags.types';

export const TagsView = () => {
  const { tags, isLoading, createTag, updateTag, deleteTag } = useTags();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const handleOpenNew = () => {
    setSelectedTag(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDrawerOpen(true);
  };

  const handleSave = async (form: TagForm): Promise<boolean> => {
    if (selectedTag) return updateTag(selectedTag.id, form);
    return createTag(form);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Catálogo de Etiquetas"
        subtitle="Gestiona las etiquetas (tags) para categorizar tus clientes, prospectos y negocios."
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva etiqueta
          </Button>
        }
      />

      <SectionCard noPadding>
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-h6 text-foreground">Etiquetas disponibles</p>
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
              <TagsIcon className="h-12 w-12 text-primary opacity-80" />
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
          <TagsTable tags={tags} onEdit={handleEdit} onDelete={deleteTag} />
        )}
      </SectionCard>

      <TagDrawer
        key={isDrawerOpen ? (selectedTag?.id ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tag={selectedTag}
        onSave={handleSave}
      />
    </PageContainer>
  );
};

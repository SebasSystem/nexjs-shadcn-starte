'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import {
  Button,
  Icon,
  Input,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
} from 'src/shared/components/ui';
import { DeleteButton, EditButton } from 'src/shared/components/ui/action-buttons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/shared/components/ui/dialog';

import { InventoryPageSkeleton } from '../components/InventoryPageSkeleton';
import { useCategories } from '../hooks/use-categories';
import type { InventoryCategory } from '../types/inventory.types';

const columnHelper = createColumnHelper<InventoryCategory>();

const COLUMNS = (
  onEdit: (cat: InventoryCategory) => void,
  onDelete: (cat: InventoryCategory) => void
) => [
  columnHelper.accessor('name', {
    header: 'Nombre',
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('key', {
    header: 'Key',
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('description', {
    header: 'Descripción',
    cell: (info) => <span className="text-sm text-muted-foreground">{info.getValue() || '—'}</span>,
  }),
  columnHelper.display({
    id: 'acciones',
    header: () => <div className="text-right w-full">Acciones</div>,
    cell: (info) => (
      <div className="flex items-center justify-end gap-1">
        <EditButton onClick={() => onEdit(info.row.original)} />
        <DeleteButton onClick={() => onDelete(info.row.original)} />
      </div>
    ),
  }),
];

export function CategoriesView() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();

  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryCategory | null>(null);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = search
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.key.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS(handleEdit, (cat) => setDeleteTarget(cat)),
    defaultRowsPerPage: 10,
  });

  function handleEdit(cat: InventoryCategory) {
    setEditing(cat);
    setName(cat.name);
    setKey(cat.key);
    setDescription(cat.description ?? '');
    setDrawerOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setName('');
    setKey('');
    setDescription('');
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!name.trim() || !key.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory.mutateAsync({
          uid: editing.uid,
          payload: {
            name: name.trim(),
            key: key.trim(),
            description: description.trim() || undefined,
          },
        });
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          key: key.trim(),
          description: description.trim() || undefined,
        });
      }
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading)
    return (
      <InventoryPageSkeleton
        title="Categorías"
        subtitle="Gestioná las categorías para clasificar productos del inventario."
      />
    );

  return (
    <PageContainer>
      <PageHeader
        title="Categorías de Producto"
        subtitle="Gestioná las categorías para clasificar productos del inventario."
        action={
          <Button color="primary" onClick={openCreate} className="gap-2">
            <Icon name="Plus" size={16} />
            Nueva Categoría
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Buscar por nombre o key..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <SectionCard noPadding>
        <TableContainer className="relative">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS(handleEdit, (cat) => setDeleteTarget(cat)).length}
                    className="py-10 text-center text-muted-foreground text-sm"
                  >
                    {search
                      ? 'No se encontraron categorías con ese criterio.'
                      : 'No hay categorías creadas. Usá el botón "Nueva Categoría" para crear la primera.'}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      {/* Drawer: Create / Edit */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="border-b border-border/60 pb-4">
            <SheetTitle>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Materia Prima"
            />
            <Input
              label="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Ej: materia_prima"
            />
            <Textarea
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional — describí el propósito de esta categoría"
              className="min-h-[80px] resize-none"
            />
          </div>

          <SheetFooter className="border-t border-border/60 pt-4 px-4 pb-4">
            <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onClick={handleSave}
              disabled={saving || !name.trim() || !key.trim()}
            >
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar categoría?</DialogTitle>
            <DialogDescription>
              Vas a eliminar <strong>{deleteTarget?.name}</strong>. Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (deleteTarget) deleteCategory.mutate(deleteTarget.uid);
                setDeleteTarget(null);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

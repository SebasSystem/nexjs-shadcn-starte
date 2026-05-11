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
  TableRow,
  useTable,
} from 'src/shared/components/table';
import {
  Button,
  ConfirmDialog,
  Icon,
  Input,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
} from 'src/shared/components/ui';

import { useExpenseCategories } from '../hooks/use-expenses';
import type { ExpenseCategory } from '../types/expenses.types';

const columnHelper = createColumnHelper<ExpenseCategory>();

export function ExpenseCategoriesView() {
  const { categories, createCategory, updateCategory, deleteCategory } = useExpenseCategories();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; uid: string }>({
    open: false,
    uid: '',
  });

  const COLUMNS = [
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: (i) => <span className="font-medium">{i.getValue()}</span>,
    }),
    columnHelper.accessor('description', {
      header: 'Descripción',
      cell: (i) => <span className="text-sm text-muted-foreground">{i.getValue() || '—'}</span>,
    }),
    columnHelper.display({
      id: 'acciones',
      header: () => <div className="text-right w-full">Acciones</div>,
      cell: (i) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              const c = i.row.original;
              setEditing(c);
              setName(c.name);
              setDescription(c.description || '');
              setDrawerOpen(true);
            }}
          >
            <Icon name="Pencil" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-red-500"
            onClick={() => setDeleteDialog({ open: true, uid: i.row.original.uid })}
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      ),
    }),
  ];
  const { table } = useTable({ data: categories, columns: COLUMNS });

  async function handleSave() {
    if (!name.trim() || !key.trim()) return;
    setSaving(true);
    try {
      const p = {
        name: name.trim(),
        key: key.trim(),
        description: description.trim() || undefined,
      };
      if (editing) {
        await updateCategory.mutateAsync({ uid: editing.uid, payload: p });
      } else {
        await createCategory.mutateAsync(p);
      }
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setName('');
    setKey('');
    setDescription('');
    setDrawerOpen(true);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Categorías de Gasto"
        subtitle="Clasificá los gastos operativos"
        action={
          <Button color="primary" onClick={openCreate} className="gap-2">
            <Icon name="Plus" size={16} />
            Nueva
          </Button>
        }
      />
      <SectionCard noPadding>
        <TableContainer>
          <Table>
            <TableHeadCustom table={table} />
            <TableBody>
              {table.getRowModel().rows.map((r) => (
                <TableRow key={r.id}>
                  {r.getVisibleCells().map((c) => (
                    <TableCell key={c.id} className="px-5">
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar' : 'Nueva'} Categoría</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-6 py-6">
            <Input
              label="Nombre"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Servicios"
            />
            <Input
              label="Clave"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Ej: services"
            />
            <Textarea
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
              className="min-h-[60px] resize-none"
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button color="primary" onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, uid: '' })}
        onConfirm={async () => {
          await deleteCategory.mutateAsync(deleteDialog.uid);
          setDeleteDialog({ open: false, uid: '' });
        }}
        title="Eliminar categoría"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="error"
      />
    </PageContainer>
  );
}

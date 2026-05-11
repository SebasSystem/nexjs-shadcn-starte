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
  Badge,
  Button,
  ConfirmDialog,
  Icon,
  Input,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from 'src/shared/components/ui';

import { useCostCenters } from '../hooks/use-expenses';
import type { CostCenter } from '../types/expenses.types';

const columnHelper = createColumnHelper<CostCenter>();

export function CostCentersView() {
  const { costCenters, createCostCenter, updateCostCenter, deleteCostCenter } = useCostCenters();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CostCenter | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; uid: string }>({
    open: false,
    uid: '',
  });

  const COLUMNS = [
    columnHelper.accessor('code', {
      header: 'Código',
      cell: (i) => (
        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{i.getValue()}</span>
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: (i) => <span className="font-medium">{i.getValue()}</span>,
    }),
    columnHelper.accessor('description', {
      header: 'Descripción',
      cell: (i) => <span className="text-sm text-muted-foreground">{i.getValue() || '—'}</span>,
    }),
    columnHelper.accessor('is_active', {
      header: 'Estado',
      cell: (i) =>
        i.getValue() ? (
          <Badge
            variant="soft"
            className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border-none"
          >
            Activo
          </Badge>
        ) : (
          <Badge
            variant="soft"
            className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full border-none"
          >
            Inactivo
          </Badge>
        ),
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
              const cc = i.row.original;
              setEditing(cc);
              setName(cc.name);
              setCode(cc.code);
              setDescription(cc.description || '');
              setIsActive(cc.is_active);
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
  const { table } = useTable({ data: costCenters, columns: COLUMNS });

  async function handleSave() {
    if (!name.trim() || !code.trim()) return;
    setSaving(true);
    try {
      const p = {
        name: name.trim(),
        key: code.trim(),
        description: description.trim() || undefined,
        is_active: isActive,
      };
      if (editing) {
        await updateCostCenter.mutateAsync({ uid: editing.uid, payload: p });
      } else {
        await createCostCenter.mutateAsync(p);
      }
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }
  function openCreate() {
    setEditing(null);
    setName('');
    setCode('');
    setDescription('');
    setIsActive(true);
    setDrawerOpen(true);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Centros de Costo"
        subtitle="Centros contables para imputar gastos"
        action={
          <Button color="primary" onClick={openCreate} className="gap-2">
            <Icon name="Plus" size={16} />
            Nuevo
          </Button>
        }
      />
      <SectionCard noPadding>
        <TableContainer>
          <Table>
            <TableHeadCustom table={table} />{' '}
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
            <SheetTitle>{editing ? 'Editar' : 'Nuevo'} Centro de Costo</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-6 py-6">
            <Input
              label="Código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: CC-ADM"
            />
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Administración"
            />
            <Input
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">Activo</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onClick={handleSave}
              disabled={saving || !name.trim() || !code.trim()}
            >
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, uid: '' })}
        onConfirm={async () => {
          await deleteCostCenter.mutateAsync(deleteDialog.uid);
          setDeleteDialog({ open: false, uid: '' });
        }}
        title="Eliminar centro de costo"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="error"
      />
    </PageContainer>
  );
}

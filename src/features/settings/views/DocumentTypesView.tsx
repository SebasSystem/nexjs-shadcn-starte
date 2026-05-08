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
  Switch,
  Textarea,
} from 'src/shared/components/ui';
import { Badge } from 'src/shared/components/ui/badge';

import { useDocumentTypes } from '../hooks/use-document-types';
import type { DocumentType } from '../types/document-type.types';

// ─── Table columns ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<DocumentType>();

const COLUMNS = (onEdit: (dt: DocumentType) => void, onDelete: (dt: DocumentType) => void) => [
  columnHelper.accessor('name', {
    header: 'Nombre',
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('description', {
    header: 'Descripción',
    cell: (info) => <span className="text-sm text-muted-foreground">{info.getValue() || '—'}</span>,
  }),
  columnHelper.accessor('validity_days', {
    header: 'Vigencia',
    cell: (info) => {
      const val = info.getValue();
      return <span className="text-sm text-muted-foreground">{val ? `${val} días` : '—'}</span>;
    },
  }),
  columnHelper.accessor('is_required', {
    header: 'Requerido',
    cell: (info) =>
      info.getValue() ? (
        <Badge
          variant="soft"
          className="bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border-none"
        >
          Requerido
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">Opcional</span>
      ),
  }),
  columnHelper.accessor('is_active', {
    header: 'Estado',
    cell: (info) =>
      info.getValue() ? (
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
    cell: (info) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(info.row.original)}
          title="Editar tipo de documento"
        >
          <Icon name="Pencil" size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(info.row.original)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          title="Eliminar tipo de documento"
        >
          <Icon name="Trash2" size={14} />
        </Button>
      </div>
    ),
  }),
];

// ─── View ───────────────────────────────────────────────────────────────────

export function DocumentTypesView() {
  const { documentTypes, isLoading, createDocumentType, updateDocumentType, deleteDocumentType } =
    useDocumentTypes();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validityDays, setValidityDays] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const { table, dense, onChangeDense } = useTable({
    data: documentTypes,
    columns: COLUMNS(handleEdit, handleDelete),
    defaultRowsPerPage: 10,
  });

  function handleEdit(dt: DocumentType) {
    setEditing(dt);
    setName(dt.name);
    setDescription(dt.description ?? '');
    setValidityDays(dt.validity_days?.toString() ?? '');
    setIsRequired(dt.is_required);
    setIsActive(dt.is_active);
    setDrawerOpen(true);
  }

  function handleDelete(dt: DocumentType) {
    if (window.confirm(`¿Eliminar el tipo de documento "${dt.name}"?`)) {
      deleteDocumentType.mutate(dt.uid);
    }
  }

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setValidityDays('');
    setIsRequired(false);
    setIsActive(true);
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        validity_days: validityDays ? Number(validityDays) : undefined,
        is_required: isRequired,
        is_active: isActive,
      };
      if (editing) {
        await updateDocumentType.mutateAsync({ uid: editing.uid, payload });
      } else {
        await createDocumentType.mutateAsync(payload);
      }
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tipos de Documento"
        subtitle="Configurá los tipos de documentos requeridos para cuentas y contactos."
        action={
          <Button color="primary" onClick={openCreate} className="gap-2">
            <Icon name="Plus" size={16} />
            Nuevo Tipo
          </Button>
        }
      />

      <SectionCard noPadding>
        <TableContainer className="relative">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS(handleEdit, handleDelete).length}
                    className="py-10 text-center text-muted-foreground text-sm"
                  >
                    {isLoading
                      ? 'Cargando...'
                      : 'No hay tipos de documento. Usá el botón "Nuevo Tipo" para crear el primero.'}
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
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editing ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-6">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Certificado Fiscal"
            />
            <Textarea
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional — describí el propósito de este tipo de documento"
              className="min-h-[60px] resize-none"
            />
            <Input
              label="Días de vigencia"
              type="number"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              placeholder="Ej: 365 (dejar vacío si no expira)"
            />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground">¿Es requerido?</span>
              <Switch checked={isRequired} onCheckedChange={setIsRequired} />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground">¿Está activo?</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
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
    </PageContainer>
  );
}

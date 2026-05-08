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
  Icon,
  Input,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from 'src/shared/components/ui';

import { useSuppliers } from '../hooks/use-expenses';
import type { Supplier } from '../types/expenses.types';

const columnHelper = createColumnHelper<Supplier>();

export function SuppliersView() {
  const { suppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const COLUMNS = [
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: (i) => <span className="font-medium">{i.getValue()}</span>,
    }),
    columnHelper.accessor('contact_name', {
      header: 'Contacto',
      cell: (i) => <span className="text-sm">{i.getValue() || '—'}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
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
              const s = i.row.original;
              setEditing(s);
              setName(s.name);
              setContactName(s.contact_name || '');
              setEmail(s.email || '');
              setPhone(s.phone || '');
              setTaxId(s.tax_id || '');
              setIsActive(s.is_active);
              setDrawerOpen(true);
            }}
          >
            <Icon name="Pencil" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-red-500"
            onClick={() => {
              if (confirm(`¿Eliminar "${i.row.original.name}"?`))
                deleteSupplier.mutate(i.row.original.uid);
            }}
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      ),
    }),
  ];
  const { table } = useTable({ data: suppliers, columns: COLUMNS });

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const p = {
        name: name.trim(),
        contact_name: contactName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        tax_id: taxId.trim() || undefined,
        is_active: isActive,
      };
      if (editing) {
        await updateSupplier.mutateAsync({ uid: editing.uid, payload: p });
      } else {
        await createSupplier.mutateAsync(p);
      }
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }
  function openCreate() {
    setEditing(null);
    setName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setTaxId('');
    setIsActive(true);
    setDrawerOpen(true);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Proveedores"
        subtitle="Gestión de proveedores"
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
            <SheetTitle>{editing ? 'Editar' : 'Nuevo'} Proveedor</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Razón social"
            />
            <Input
              label="Persona de contacto"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input
              label="ID Fiscal"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="RUC / NIT"
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
            <Button color="primary" onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}

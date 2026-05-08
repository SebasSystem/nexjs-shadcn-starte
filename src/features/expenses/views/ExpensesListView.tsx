'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { formatMoney } from 'src/lib/currency';
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
  Icon,
  Input,
  SelectField,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui';

import {
  useCostCenters,
  useExpenseCategories,
  useExpenses,
  useSuppliers,
} from '../hooks/use-expenses';
import type { Expense, ExpensePayload } from '../types/expenses.types';

const columnHelper = createColumnHelper<Expense>();

export function ExpensesListView() {
  const { expenses, createExpense, updateExpense, deleteExpense } = useExpenses();
  const { categories } = useExpenseCategories();
  const { suppliers } = useSuppliers();
  const { costCenters } = useCostCenters();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [categoryUid, setCategoryUid] = useState('');
  const [supplierUid, setSupplierUid] = useState('');
  const [costCenterUid, setCostCenterUid] = useState('');
  const [saving, setSaving] = useState(false);

  const COLUMNS = [
    columnHelper.accessor('expense_number', {
      header: 'N°',
      cell: (i) => <span className="font-mono text-xs text-muted-foreground">{i.getValue()}</span>,
    }),
    columnHelper.accessor('description', {
      header: 'Descripción',
      cell: (i) => <span className="font-medium text-foreground">{i.getValue()}</span>,
    }),
    columnHelper.accessor('amount', {
      header: 'Monto',
      cell: (i) => (
        <span className="font-semibold text-foreground">{formatMoney(i.getValue())}</span>
      ),
    }),
    columnHelper.accessor('category', {
      header: 'Categoría',
      cell: (i) => <span className="text-sm">{i.getValue()?.name || '—'}</span>,
    }),
    columnHelper.accessor('expense_date', {
      header: 'Fecha',
      cell: (i) => (
        <span className="text-sm">
          {format(new Date(i.getValue()), 'dd MMM yyyy', { locale: es })}
        </span>
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
              const e = i.row.original;
              setEditing(e);
              setDescription(e.description);
              setAmount(String(e.amount));
              setExpenseDate(e.expense_date?.substring(0, 10) || '');
              setCategoryUid(e.category?.uid || '');
              setSupplierUid(e.supplier?.uid || '');
              setCostCenterUid(e.cost_center?.uid || '');
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
              if (confirm('¿Eliminar?')) deleteExpense.mutate(i.row.original.uid);
            }}
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      ),
    }),
  ];

  const { table } = useTable({ data: expenses, columns: COLUMNS });

  async function handleSave() {
    if (!description.trim() || !amount) return;
    setSaving(true);
    try {
      const payload: ExpensePayload = {
        description: description.trim(),
        amount: Number(amount),
        expense_date: expenseDate || new Date().toISOString().substring(0, 10),
        expense_category_uid: categoryUid || undefined,
        supplier_uid: supplierUid || undefined,
        cost_center_uid: costCenterUid || undefined,
      };
      if (editing) {
        await updateExpense.mutateAsync({ uid: editing.uid, payload });
      } else {
        await createExpense.mutateAsync(payload);
      }
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setDescription('');
    setAmount('');
    setExpenseDate('');
    setCategoryUid('');
    setSupplierUid('');
    setCostCenterUid('');
    setDrawerOpen(true);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Gastos"
        subtitle="Registro de gastos operativos"
        action={
          <Button color="primary" onClick={openCreate} className="gap-2">
            <Icon name="Plus" size={16} />
            Nuevo Gasto
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
            <SheetTitle>{editing ? 'Editar Gasto' : 'Nuevo Gasto'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <Input
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de servicios"
            />
            <Input
              label="Monto"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Fecha"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
            <SelectField
              label="Categoría"
              options={[
                { value: '', label: 'Sin categoría' },
                ...categories.map((c) => ({ value: c.uid, label: c.name })),
              ]}
              value={categoryUid}
              onChange={(v) => setCategoryUid(v as string)}
            />
            <SelectField
              label="Proveedor"
              options={[
                { value: '', label: 'Sin proveedor' },
                ...suppliers.map((s) => ({ value: s.uid, label: s.name })),
              ]}
              value={supplierUid}
              onChange={(v) => setSupplierUid(v as string)}
            />
            <SelectField
              label="Centro de Costo"
              options={[
                { value: '', label: 'Sin centro' },
                ...costCenters.map((cc) => ({ value: cc.uid, label: cc.name })),
              ]}
              value={costCenterUid}
              onChange={(v) => setCostCenterUid(v as string)}
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onClick={handleSave}
              disabled={saving || !description.trim() || !amount}
            >
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}

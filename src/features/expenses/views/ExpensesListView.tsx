'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useState } from 'react';
import { formatMoney } from 'src/lib/currency';
import { formatDate } from 'src/lib/date';
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
  ConfirmDialog,
  DeleteButton,
  EditButton,
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
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [costCenterFilter, setCostCenterFilter] = useState('');
  const { expenses, createExpense, updateExpense, deleteExpense, pagination } = useExpenses({
    status: statusFilter || undefined,
    category_uid: categoryFilter || undefined,
    supplier_uid: supplierFilter || undefined,
    cost_center_uid: costCenterFilter || undefined,
  });
  const { categories } = useExpenseCategories();
  const { suppliers } = useSuppliers();
  const { costCenters } = useCostCenters();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [categoryUid, setCategoryUid] = useState('');
  const [supplierUid, setSupplierUid] = useState('');
  const [costCenterUid, setCostCenterUid] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; uid: string }>({
    open: false,
    uid: '',
  });

  const COLUMNS = [
    columnHelper.accessor('expense_number', {
      header: 'N°',
      cell: (i) => <span className="font-mono text-xs text-muted-foreground">{i.getValue()}</span>,
    }),
    columnHelper.accessor('title', {
      header: 'Título',
      cell: (i) => <span className="font-medium text-foreground">{i.getValue()}</span>,
    }),
    columnHelper.accessor('description', {
      header: 'Descripción',
      cell: (i) => <span className="text-sm text-muted-foreground">{i.getValue()}</span>,
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
          {formatDate(i.getValue(), { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: () => <div className="text-right w-full">Acciones</div>,
      cell: (i) => (
        <div className="flex items-center justify-end gap-1">
          <EditButton
            onClick={() => {
              const e = i.row.original;
              setEditing(e);
              setTitle(e.title || '');
              setDescription(e.description);
              setAmount(String(e.amount));
              setExpenseDate(e.expense_date?.substring(0, 10) || '');
              setCategoryUid(e.category?.uid || '');
              setSupplierUid(e.supplier?.uid || '');
              setCostCenterUid(e.cost_center?.uid || '');
              setDrawerOpen(true);
            }}
          />
          <DeleteButton onClick={() => setDeleteDialog({ open: true, uid: i.row.original.uid })} />
        </div>
      ),
    }),
  ];

  const { table, dense, onChangeDense } = useTable({
    data: expenses,
    columns: COLUMNS,
    total: pagination.total,
    pageIndex: pagination.page - 1,
    pageSize: pagination.rowsPerPage,
    onPageChange: (pi: number) => pagination.onChangePage(pi + 1),
    onPageSizeChange: pagination.onChangeRowsPerPage,
  });

  async function handleSave() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'El título es requerido';
    if (!description.trim()) errs.description = 'La descripción es requerida';
    if (!amount) errs.amount = 'El monto es requerido';
    if (!categoryUid) errs.category = 'La categoría es requerida';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload: ExpensePayload = {
        title: title.trim(),
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
    setTitle('');
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
      {/* Filters — server-side via useExpenses */}
      <div className="flex flex-wrap items-end gap-3 px-5 py-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Buscar"
            placeholder="Buscar gastos..."
            value={pagination.search ?? ''}
            onChange={(e) => pagination.onChangeSearch(e.target.value)}
            leftIcon={<Icon name="Search" size={15} />}
          />
        </div>
        <SelectField
          label="Estado"
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'draft', label: 'Borrador' },
            { value: 'submitted', label: 'Enviado' },
            { value: 'approved', label: 'Aprobado' },
            { value: 'paid', label: 'Pagado' },
          ]}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as string)}
        />
        <SelectField
          label="Categoría"
          options={[
            { value: '', label: 'Todas las categorías' },
            ...categories.map((c) => ({ value: c.uid, label: c.name })),
          ]}
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as string)}
        />
        <SelectField
          label="Proveedor"
          options={[
            { value: '', label: 'Todos los proveedores' },
            ...suppliers.map((s) => ({ value: s.uid, label: s.name })),
          ]}
          value={supplierFilter}
          onChange={(v) => setSupplierFilter(v as string)}
        />
        <SelectField
          label="Centro de Costo"
          options={[
            { value: '', label: 'Todos los centros' },
            ...costCenters.map((cc) => ({ value: cc.uid, label: cc.name })),
          ]}
          value={costCenterFilter}
          onChange={(v) => setCostCenterFilter(v as string)}
        />
      </div>
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
        <div className="border-t border-border/40">
          <TablePaginationCustom
            table={table}
            total={pagination.total}
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </div>
      </SectionCard>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar Gasto' : 'Nuevo Gasto'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-6 py-6">
            <Input
              label="Título"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((p) => ({ ...p, title: '' }));
              }}
              placeholder="Ej: Pago de servicios"
              error={errors.title}
            />
            <Input
              label="Descripción"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: '' }));
              }}
              placeholder="Ej: Pago de servicios"
              error={errors.description}
            />
            <Input
              label="Monto"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors((p) => ({ ...p, amount: '' }));
              }}
              placeholder="0.00"
              error={errors.amount}
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
                { value: '', label: 'Seleccionar categoría' },
                ...categories.map((c) => ({ value: c.uid, label: c.name })),
              ]}
              value={categoryUid}
              onChange={(v) => {
                setCategoryUid(v as string);
                setErrors((p) => ({ ...p, category: '' }));
              }}
              error={errors.category}
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
              disabled={saving || !title.trim() || !description.trim() || !amount}
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
          await deleteExpense.mutateAsync(deleteDialog.uid);
          setDeleteDialog({ open: false, uid: '' });
        }}
        title="Eliminar gasto"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="error"
      />
    </PageContainer>
  );
}

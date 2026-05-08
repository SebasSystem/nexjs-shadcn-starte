'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { Badge, Button } from 'src/shared/components/ui';

import { usePurchaseOrders } from '../hooks/use-purchase-orders';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types/purchase-order.types';

const STATUS_MAP: Record<PurchaseOrderStatus, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  pending_approval: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Aprobada', color: 'bg-blue-50 text-blue-700' },
  ordered: { label: 'Ordenada', color: 'bg-indigo-50 text-indigo-700' },
  partially_received: { label: 'Parcial', color: 'bg-orange-50 text-orange-700' },
  received: { label: 'Recibida', color: 'bg-emerald-50 text-emerald-700' },
  closed: { label: 'Cerrada', color: 'bg-gray-200 text-gray-500' },
  cancelled: { label: 'Cancelada', color: 'bg-red-50 text-red-500' },
};

const columnHelper = createColumnHelper<PurchaseOrder>();

export function PurchaseOrdersView() {
  const { orders, approveOrder, receiveOrder } = usePurchaseOrders();

  const COLUMNS = [
    columnHelper.accessor('purchase_number', {
      header: 'N° OC',
      cell: (i) => <span className="font-semibold">{i.getValue()}</span>,
    }),
    columnHelper.accessor('supplier', {
      header: 'Proveedor',
      cell: (i) => <span className="text-sm">{i.getValue()?.name || '—'}</span>,
    }),
    columnHelper.accessor('total', {
      header: 'Total',
      cell: (i) => <span className="font-semibold">{formatMoney(i.getValue())}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Estado',
      cell: (i) => {
        const { label, color } = STATUS_MAP[i.getValue()];
        return (
          <Badge
            variant="soft"
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-none ${color}`}
          >
            {label}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('ordered_at', {
      header: 'Fecha',
      cell: (i) => (
        <span className="text-sm text-muted-foreground">
          {i.getValue() ? format(new Date(i.getValue()!), 'dd MMM yyyy', { locale: es }) : '—'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: () => <div className="text-right w-full">Acciones</div>,
      cell: (i) => {
        const o = i.row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {o.status === 'pending_approval' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => approveOrder.mutate(o.uid)}
                className="text-xs text-success"
              >
                Aprobar
              </Button>
            )}
            {o.status === 'approved' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => receiveOrder.mutate(o.uid)}
                className="text-xs text-primary"
              >
                Recibir
              </Button>
            )}
          </div>
        );
      },
    }),
  ];
  const { table } = useTable({ data: orders, columns: COLUMNS });

  return (
    <PageContainer>
      <PageHeader title="Órdenes de Compra" subtitle="Gestión de compras a proveedores" />
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
    </PageContainer>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { Eye, AlertCircle, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { BillingStatusBadge } from 'src/features/admin/components/billing-status-badge';
import { Factura } from 'src/features/admin/types/admin.types';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';

interface BillingTableProps {
  facturas: Factura[];
  onViewDetail: (factura: Factura) => void;
  onMarcarPagadas: (ids: string[]) => Promise<void>;
}

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isVencida(dateStr: string) {
  return new Date(dateStr) < new Date();
}

const columnHelper = createColumnHelper<Factura>();

export function BillingTable({ facturas, onViewDetail, onMarcarPagadas }: BillingTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleAll = () => {
    if (selected.length === facturas.length) {
      setSelected([]);
    } else {
      setSelected(facturas.map((f) => f.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleMarcarPagadas = async () => {
    setIsProcessing(true);
    try {
      await onMarcarPagadas(selected);
      setSelected([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const COLUMNS = useMemo(
    () => [
      columnHelper.display({
        id: 'selection',
        header: () => (
          <input
            type="checkbox"
            checked={selected.length === facturas.length && facturas.length > 0}
            onChange={toggleAll}
            className="rounded"
          />
        ),
        cell: (info) => {
          const factura = info.row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.includes(factura.id)}
                onChange={() => toggleOne(factura.id)}
                className="rounded"
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('tenantNombre', {
        header: 'Tenant',
        cell: (info) => {
          const name = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground text-body2 truncate">{name}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('periodo', {
        header: 'Periodo',
        cell: (info) => <span className="text-body2 text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('planNombre', {
        header: 'Plan',
        cell: (info) => (
          <Badge variant="outline" className="text-xs">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('total', {
        header: 'Monto',
        cell: (info) => (
          <span className="font-semibold text-foreground">${info.getValue().toFixed(2)}</span>
        ),
      }),
      columnHelper.accessor('fechaEmision', {
        header: 'Emisión',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor('fechaVencimiento', {
        header: 'Vencimiento',
        cell: (info) => {
          const factura = info.row.original;
          const vencidaDate = isVencida(factura.fechaVencimiento) && factura.estado !== 'PAGADA';
          if (vencidaDate) {
            return (
              <span className="flex items-center gap-1 text-red-600 font-semibold text-body2">
                <AlertCircle className="h-3.5 w-3.5" />
                {formatDate(factura.fechaVencimiento)}
              </span>
            );
          }
          return (
            <span className="text-body2 text-muted-foreground">
              {formatDate(factura.fechaVencimiento)}
            </span>
          );
        },
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BillingStatusBadge estado={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => {
          const factura = info.row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onViewDetail(factura)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, facturas.length, onViewDetail]
  );

  const { table, dense, onChangeDense } = useTable({
    data: facturas,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  if (facturas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileText className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron facturas con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} onClick={() => onViewDetail(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="border-t border-border/40">
        <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
      </div>

      {/* Floating bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-foreground text-background rounded-2xl px-6 py-3 shadow-xl">
          <span className="text-body2 font-medium">
            {selected.length}{' '}
            {selected.length === 1 ? 'factura seleccionada' : 'facturas seleccionadas'}
          </span>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={handleMarcarPagadas}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Marcar como Pagadas'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-background hover:text-background hover:bg-white/10"
            onClick={() => setSelected([])}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}

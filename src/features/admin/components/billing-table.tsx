'use client';

import { flexRender } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { Factura } from 'src/features/admin/types/admin.types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  TableSkeleton,
  useTable,
} from 'src/shared/components/table';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import { buildBillingColumns } from './billing-columns';

interface BillingTableProps {
  facturas: Factura[];
  isLoading?: boolean;
  onViewDetail: (factura: Factura) => void;
  onMarcarPagadas: (ids: string[]) => Promise<void>;
}

export function BillingTable({
  facturas,
  isLoading,
  onViewDetail,
  onMarcarPagadas,
}: BillingTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.length === facturas.length ? [] : facturas.map((f) => f.uid)));
  }, [facturas]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

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
    () => buildBillingColumns({ selected, facturas, onViewDetail, toggleOne, toggleAll }),
    [selected, facturas, onViewDetail, toggleOne, toggleAll]
  );

  const { table, dense, onChangeDense } = useTable({
    data: isLoading ? [] : facturas,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  if (!isLoading && facturas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Icon name="FileText" className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron facturas con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <TableContainer>
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {isLoading ? (
              <TableSkeleton rows={10} columns={9} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} onClick={() => onViewDetail(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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

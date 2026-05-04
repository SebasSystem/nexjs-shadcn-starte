'use client';

import { flexRender } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Tenant } from 'src/features/admin/types/admin.types';
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
import { Icon } from 'src/shared/components/ui/icon';

import { buildTenantColumns } from './tenant-columns';

interface TenantsTableProps {
  tenants: Tenant[];
  isLoading?: boolean;
  onEdit: (tenant: Tenant) => void;
  onViewDetail: (tenant: Tenant) => void;
  onSuspend: (tenant: Tenant) => void;
  onActivate: (tenant: Tenant) => void;
}

export function TenantsTable({
  tenants,
  isLoading,
  onEdit,
  onViewDetail,
  onSuspend,
  onActivate,
}: TenantsTableProps) {
  const COLUMNS = useMemo(
    () => buildTenantColumns({ onEdit, onViewDetail, onSuspend, onActivate }),
    [onEdit, onViewDetail, onSuspend, onActivate]
  );

  const { table, dense, onChangeDense } = useTable({
    data: isLoading ? [] : tenants,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  if (!isLoading && tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Icon name="UserCheck" className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron tenants con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TableContainer>
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {isLoading ? (
              <TableSkeleton rows={10} columns={8} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
    </div>
  );
}

'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
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
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';

import type { CommissionAssignment } from '../../types/commissions.types';

interface AssignmentsTableProps {
  asignaciones: CommissionAssignment[];
  isLoading: boolean;
  onEdit: (asignacion: CommissionAssignment) => void;
  onToggleStatus: (id: string, nuevoEstado: string) => void;
}

const columnHelper = createColumnHelper<CommissionAssignment>();

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({
  asignaciones,
  isLoading,
  onEdit,
  onToggleStatus,
}) => {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('user_name', {
        header: 'Vendedor',
        cell: (info) => {
          const name = info.getValue() || '';
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600 font-bold">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{name}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('team_name', {
        header: 'Equipo',
        cell: (info) => (
          <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('plan_name', {
        header: 'Plan Asignado',
        cell: (info) => {
          const row = info.row.original;
          const plan = info.getValue();
          return (
            <span
              className={
                row.status === 'SIN_ASIGNAR'
                  ? 'text-muted-foreground italic'
                  : 'font-medium text-foreground'
              }
            >
              {plan || '— Sin plan asignado'}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'vigencia',
        header: 'Vigencia',
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="text-muted-foreground">
              {row.start_date ? format(new Date(row.start_date), 'dd/MM/yyyy') : '—'}
              {row.end_date ? ` - ${format(new Date(row.end_date), 'dd/MM/yyyy')}` : ''}
            </span>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const val = info.getValue();
          if (val === 'ACTIVO')
            return (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
              >
                Activo
              </Badge>
            );
          if (val === 'INACTIVO')
            return (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
              >
                Inactivo
              </Badge>
            );
          if (val === 'SIN_ASIGNAR')
            return (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
              >
                Sin Asignar
              </Badge>
            );
          return null;
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => {
          const asg = info.row.original;
          return (
            <div
              className="flex items-center justify-end gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {asg.status === 'SIN_ASIGNAR' ? (
                <button
                  onClick={() => onEdit(asg)}
                  className="text-blue-600 border border-blue-600 px-3 py-1 rounded-md text-xs hover:bg-blue-50 transition-colors"
                >
                  Asignar Plan
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(asg)}
                    className="text-muted-foreground hover:text-blue-600 px-2 py-1 text-xs transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      onToggleStatus(asg.uid, asg.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO')
                    }
                    className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                      asg.status === 'ACTIVO'
                        ? 'text-red-600 border-red-200 hover:bg-red-50'
                        : 'text-green-600 border-green-200 hover:bg-green-50'
                    }`}
                  >
                    {asg.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                  </button>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [onEdit, onToggleStatus]
  );

  const { table, dense, onChangeDense } = useTable({
    data: asignaciones,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-10 px-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (!asignaciones.length) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <h3 className="text-lg font-medium text-muted-foreground">No hay vendedores asignados</h3>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TableContainer>
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={!dense ? 'py-4' : undefined}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="border-t border-border/40">
        <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
      </div>
    </div>
  );
};

'use client';

import React, { useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { type PlanComision } from '../../types/commissions.types';
import { Icon } from 'src/shared/components/ui/icon';
import { format } from 'date-fns';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from 'src/shared/components/table';
import { SectionCard } from 'src/shared/components/ui/section-card';

interface PlansTableProps {
  planes: PlanComision[];
  isLoading: boolean;
  onEdit: (plan: PlanComision) => void;
}

const columnHelper = createColumnHelper<PlanComision>();

export const PlansTable: React.FC<PlansTableProps> = ({ planes, isLoading, onEdit }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const COLUMNS = useMemo(
    () => [
      columnHelper.display({
        id: 'expander',
        header: '',
        cell: (info) => {
          const plan = info.row.original;
          return (
            <div className="text-muted-foreground w-4">
              {expandedId === plan.id ? <Icon name="ChevronDown" size={18} /> : <Icon name="ChevronRight" size={18} />}
            </div>
          );
        },
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre del Plan',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('tipo', {
        header: 'Tipo',
        cell: (info) => {
          const tipo = info.getValue();
          if (tipo === 'VENTA')
            return (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Por Venta
              </span>
            );
          if (tipo === 'MARGEN')
            return (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Por Margen
              </span>
            );
          if (tipo === 'META')
            return (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Por Meta
              </span>
            );
          return null;
        },
      }),
      columnHelper.accessor('porcentajeBase', {
        header: 'Base',
        cell: (info) => <span className="font-medium">{info.getValue()}%</span>,
      }),
      columnHelper.accessor((row) => row.tramos.length, {
        id: 'tramos',
        header: 'Tramos',
        cell: (info) => <span>{info.getValue()} config.</span>,
      }),
      columnHelper.accessor('rolesAplicables', {
        header: 'Rol Aplicable',
        cell: (info) => (
          <div className="flex gap-1 flex-wrap">
            {info.getValue().map((role) => (
              <span
                key={role}
                className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded border border-border/40"
              >
                {role}
              </span>
            ))}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'vigencia',
        header: 'Vigencia',
        cell: (info) => {
          const plan = info.row.original;
          return (
            <span className="text-muted-foreground text-sm">
              {format(new Date(plan.fechaInicio), 'dd/MM/yyyy')}
              {plan.fechaFin
                ? ` - ${format(new Date(plan.fechaFin), 'dd/MM/yyyy')}`
                : ' - Indefinido'}
            </span>
          );
        },
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => {
          const val = info.getValue();
          return (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                val === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
              }`}
            >
              {val}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => {
          const plan = info.row.original;
          return (
            <div
              className="flex items-center justify-end gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onEdit(plan)}
                className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                title="Editar"
              >
                <Icon name="Edit" size={16} />
              </button>
              <button
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Duplicar"
              >
                <Icon name="Copy" size={16} />
              </button>
            </div>
          );
        },
      }),
    ],
    [expandedId, onEdit]
  );

  const { table, dense, onChangeDense } = useTable({
    data: planes,
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

  if (!planes.length) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Icon name="MoreVertical" className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium">Aún no hay planes configurados</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">Crea tu primer plan de comisión.</p>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition-colors">
          Crear Plan
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TableContainer>
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.map((row) => {
              const plan = row.original;
              const isExpanded = expandedId === plan.id;
              return (
                <React.Fragment key={row.id}>
                  <TableRow onClick={() => toggleExpand(plan.id)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={!dense ? 'py-4' : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length} className="px-8 py-4">
                        <SectionCard className="max-w-xl border shadow-sm" noPadding>
                          <div className="px-6 py-4 border-b">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                              Escalones de Comisión
                            </h4>
                          </div>
                          <Table>
                            <thead className="bg-muted/20">
                              <tr>
                                <th className="text-left py-2 px-6 font-medium text-xs text-muted-foreground uppercase">
                                  Desde
                                </th>
                                <th className="text-left py-2 px-6 font-medium text-xs text-muted-foreground uppercase">
                                  Hasta
                                </th>
                                <th className="text-right py-2 px-6 font-medium text-xs text-muted-foreground uppercase">
                                  % Aplicado
                                </th>
                              </tr>
                            </thead>
                            <TableBody>
                              {plan.tramos.map((tramo, index) => (
                                <TableRow key={tramo.id || index}>
                                  <TableCell className="py-2.5 px-6">
                                    ${tramo.desde.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="py-2.5 px-6">
                                    {tramo.hasta
                                      ? `$${tramo.hasta.toLocaleString()}`
                                      : 'Sin límite'}
                                  </TableCell>
                                  <TableCell className="py-2.5 px-6 text-right font-medium text-blue-600">
                                    {tramo.porcentajeAplicado}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </SectionCard>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="border-t border-border/40">
        <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
      </div>
    </div>
  );
};

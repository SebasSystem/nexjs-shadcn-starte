import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeadCustom,
  useTable,
  TablePaginationCustom,
  TableContainer,
} from 'src/shared/components/table';
import { Button } from 'src/shared/components/ui/button';
import { Badge } from 'src/shared/components/ui/badge';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import type { Segment } from '../../types/segments.types';
import { Icon } from 'src/shared/components/ui/icon';

interface SegmentsTableProps {
  segments: Segment[];
  onEdit: (segment: Segment) => void;
  onDelete: (id: string) => void;
  onRun: (segment: Segment) => void;
}

const columnHelper = createColumnHelper<Segment>();

export const SegmentsTable: React.FC<SegmentsTableProps> = ({
  segments,
  onEdit,
  onDelete,
  onRun,
}) => {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Segmento',
        cell: (info) => {
          const s = info.row.original;
          return (
            <div>
              <p className="text-sm font-semibold text-foreground">{s.nombre}</p>
              <p
                className="text-xs text-muted-foreground truncate max-w-[250px]"
                title={s.descripcion}
              >
                {s.descripcion || 'Sin descripción'}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor('reglas', {
        header: 'Condiciones',
        cell: (info) => {
          const reglas = info.getValue();
          const logica = info.row.original.logica;
          return (
            <div className="flex items-center gap-1.5 flex-wrap max-w-[300px]">
              {reglas.slice(0, 2).map((r, i) => (
                <React.Fragment key={r.id}>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono bg-muted/20">
                    {r.field}
                  </Badge>
                  {i === 0 && reglas.length > 1 && (
                    <span className="text-[10px] font-bold text-blue-600">{logica}</span>
                  )}
                </React.Fragment>
              ))}
              {reglas.length > 2 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{reglas.length - 2} más
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('totalContactos', {
        header: 'Contactos',
        cell: (info) => (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icon name="Users" className="h-4 w-4 text-emerald-600" />
            {info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('ultimaActualizacion', {
        header: 'Modificado',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {new Date(info.getValue() as string).toLocaleDateString('es-MX')}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: '',
        cell: (info) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => onRun(info.row.original)}
            >
              <Icon name="Play" className="h-3 w-3" />
              Ejecutar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(info.row.original)}
            >
              <Icon name="Edit" className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(info.row.original.id)}
            >
              <Icon name="Trash2" className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete, onRun]
  );

  const { table, dense, onChangeDense } = useTable({
    data: segments,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  return (
    <div className="w-full">
      <TableContainer className="relative min-h-[300px]">
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3 px-5">
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

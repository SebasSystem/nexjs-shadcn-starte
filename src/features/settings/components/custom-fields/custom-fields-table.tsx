'use client';

import { useMemo } from 'react';
import { Icon } from 'src/shared/components/ui/icon';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import type { CampoPersonalizado, TipoCampo, ModuloCampo } from '../../types/settings.types';
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
import { createColumnHelper, flexRender } from '@tanstack/react-table';

const TIPO_LABELS: Record<TipoCampo, string> = {
  texto: 'Texto',
  numero: 'Número',
  fecha: 'Fecha',
  select: 'Lista de opciones',
  booleano: 'Sí / No',
};

const MODULO_LABELS: Record<ModuloCampo, string> = {
  contactos: 'Contactos',
  empresas: 'Empresas',
  oportunidades: 'Oportunidades',
  productos: 'Productos',
};

const columnHelper = createColumnHelper<CampoPersonalizado>();

interface CustomFieldsTableProps {
  campos: CampoPersonalizado[];
  onEdit: (campo: CampoPersonalizado) => void;
  onDelete: (campo: CampoPersonalizado) => void;
}

export function CustomFieldsTable({ campos, onEdit, onDelete }: CustomFieldsTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('etiqueta', {
        header: 'Etiqueta',
        cell: (info) => {
          const campo = info.row.original;
          return (
            <div>
              <p className="font-medium text-foreground text-sm">{campo.etiqueta}</p>
              {campo.tipo === 'select' && campo.opciones && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {campo.opciones.slice(0, 3).join(', ')}
                  {campo.opciones.length > 3 ? '...' : ''}
                </p>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre técnico',
        cell: (info) => (
          <code className="text-xs bg-muted/60 px-1.5 py-0.5 rounded font-mono">
            {info.getValue()}
          </code>
        ),
      }),
      columnHelper.accessor('tipo', {
        header: 'Tipo',
        cell: (info) => (
          <Badge variant="outline" className="text-xs">
            {TIPO_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor('modulo', {
        header: 'Módulo',
        cell: (info) => (
          <Badge variant="soft" color="default" className="text-xs">
            {MODULO_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor('requerido', {
        header: 'Requerido',
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="soft" color="error" className="text-xs">
              Sí
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">No</span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const campo = info.row.original;
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(campo)}>
                <Icon name="Pencil" size={14} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Icon name="MoreHorizontal" size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(campo)}>Editar campo</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => onDelete(campo)}>
                    Eliminar campo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onEdit, onDelete]
  );

  const { table, dense, onChangeDense } = useTable({
    data: campos,
    columns: COLUMNS,
    defaultRowsPerPage: 25,
  });

  if (campos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Icon name="Sliders" size={40} className="mb-3 opacity-40" />
        <p className="text-sm">No hay campos personalizados configurados.</p>
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
                  <TableCell key={cell.id}>
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
}

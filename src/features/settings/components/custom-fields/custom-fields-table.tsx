'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo } from 'react';
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
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { Icon } from 'src/shared/components/ui/icon';

import type { CustomField, CustomFieldModule, CustomFieldType } from '../../types/settings.types';

const TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Texto',
  number: 'Número',
  date: 'Fecha',
  select: 'Lista de opciones',
  boolean: 'Sí / No',
};

const MODULE_LABELS: Record<CustomFieldModule, string> = {
  contacts: 'Contactos',
  companies: 'Empresas',
  opportunities: 'Oportunidades',
  products: 'Productos',
};

const columnHelper = createColumnHelper<CustomField>();

interface CustomFieldsTableProps {
  fields: CustomField[];
  onEdit: (field: CustomField) => void;
  onDelete: (field: CustomField) => void;
}

export function CustomFieldsTable({ fields, onEdit, onDelete }: CustomFieldsTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('label', {
        header: 'Etiqueta',
        cell: (info) => {
          const field = info.row.original;
          return (
            <div>
              <p className="font-medium text-foreground text-sm">{field.label}</p>
              {field.type === 'select' && field.options && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {field.options.slice(0, 3).join(', ')}
                  {field.options.length > 3 ? '...' : ''}
                </p>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        header: 'Nombre técnico',
        cell: (info) => (
          <code className="text-xs bg-muted/60 px-1.5 py-0.5 rounded font-mono">
            {info.getValue()}
          </code>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: (info) => (
          <Badge variant="outline" className="text-xs">
            {TYPE_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor('module', {
        header: 'Módulo',
        cell: (info) => (
          <Badge variant="soft" color="default" className="text-xs">
            {MODULE_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor('required', {
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
          const field = info.row.original;
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => onEdit(field)}
              >
                <Icon name="Pencil" size={14} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                    <Icon name="MoreHorizontal" size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(field)}>Editar campo</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => onDelete(field)}>
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
    data: fields,
    columns: COLUMNS,
    defaultRowsPerPage: 25,
  });

  if (fields.length === 0) {
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

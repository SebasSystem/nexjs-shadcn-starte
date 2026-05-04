import { createColumnHelper, flexRender } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { formatDate } from 'src/lib/date';
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
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import type { Tag, TagColor, TagEntity } from '../../types/tags.types';

interface TagsTableProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
}

const columnHelper = createColumnHelper<Tag>();

export const BadgeColorMap: Record<TagColor, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
};

const EntityLabelMap: Record<TagEntity, string> = {
  CONTACT: 'Contactos',
  DEAL: 'Negocios',
  LEAD: 'Prospectos',
  COMPANY: 'Empresas',
};

export const TagsTable: React.FC<TagsTableProps> = ({ tags, onEdit, onDelete }) => {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Etiqueta',
        cell: (info) => {
          const tag = info.row.original;
          return (
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                BadgeColorMap[tag.color]
              }`}
            >
              {tag.nombre}
            </span>
          );
        },
      }),
      columnHelper.accessor('entidades', {
        header: 'Aplica en',
        cell: (info) => {
          const entidades = info.getValue() as TagEntity[];
          return (
            <div className="flex flex-wrap gap-1.5">
              {entidades.map((e) => (
                <span
                  key={e}
                  className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium"
                >
                  {EntityLabelMap[e]}
                </span>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor('creadoEn', {
        header: 'Fecha de Creación',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(info.getValue() as string)}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: '',
        cell: (info) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(info.row.original)}
            >
              <Icon name="Edit" size={16} className="text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(info.row.original.id)}
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  const { table, dense, onChangeDense } = useTable({
    data: tags,
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
                  <TableCell key={cell.id} className="px-5">
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

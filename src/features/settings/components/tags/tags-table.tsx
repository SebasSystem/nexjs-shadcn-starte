import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeadCustom,
  useTable,
  TablePaginationCustom,
} from 'src/shared/components/table';
import { Button } from 'src/shared/components/ui/button';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import type { Tag, TagColor, TagEntity } from '../../types/tags.types';
import { Trash2, Edit } from 'lucide-react';

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
            {new Date(info.getValue() as string).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
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
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(info.row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
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
      <div className="overflow-x-auto relative min-h-[300px]">
        <Table>
          <TableHeadCustom table={table} />
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-b border-border/40 hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3 px-5">
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
    </div>
  );
};

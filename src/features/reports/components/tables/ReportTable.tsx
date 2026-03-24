'use client';

import React, { useState, useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { Icon, Badge, Input, Table, TableBody, TableRow, TableCell } from 'src/shared/components/ui';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/shared/components/table';
import { StockBadge } from 'src/features/inventory/components/StockBadge';
import { cn } from 'src/lib/utils';
import { Card } from 'src/shared/components/ui/card';

const getHeaderIcon = (label: string): any => {
  const l = label.toLowerCase();
  if (l.includes('product')) return 'Package';
  if (l.includes('sku')) return 'Tag';
  if (l.includes('categor')) return 'Layers';
  if (l.includes('bodega') || l.includes('origen') || l.includes('destin')) return 'Warehouse';
  if (l.includes('fech') || l.includes('date')) return 'CalendarDays';
  if (l.includes('usuari') || l.includes('client')) return 'Users';
  if (l.includes('cotizaci')) return 'FileText';
  if (l.includes('stock') || l.includes('cantidad') || l.includes('unidades')) return 'Box';
  return null;
}

const getCellIcon = (id: string): any => {
  const l = id.toLowerCase();
  if (l === 'producto' || l === 'product') return 'Package';
  if (l === 'categoría' || l === 'category' || l === 'categoria') return 'Layers';
  if (l === 'bodega' || l === 'store' || l === 'origen' || l === 'destino') return 'Store';
  if (l.includes('cliente') || l.includes('usuario') || l.includes('user')) return 'User';
  return null;
}

export function ReportTable({ data, columns }: { data: any[], columns: any[] }) {
  const [search, setSearch] = useState('');
  
  const filteredData = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((row) => 
      Object.values(row).some((val) => 
        String(val).toLowerCase().includes(lower)
      )
    );
  }, [data, search]);

  const tanstackColumns = useMemo(() => {
    const helper = createColumnHelper<any>();
    return columns.map(col => helper.accessor(col.id, {
      header: () => {
        return (
          <div className="flex items-center whitespace-nowrap">
            <span>{col.label}</span>
          </div>
        );
      },
      cell: (info) => {
        const row = info.row.original;
        if (col.id === 'Status' || col.id === 'statusBadge') {
          return row.statusBadge ? (
            <Badge variant="soft" color={row.statusBadge.color}>{row.statusBadge.label}</Badge>
          ) : (
            <StockBadge status={row.stockStatus || 'available'} />
          );
        }
        if (col.id === 'Progress' || col.id === 'pct') {
          return <span className="text-muted-foreground font-medium">{row[col.id]}%</span>;
        }

        const cIcon = getCellIcon(col.id);
        
        return (
          <div className="flex items-center gap-2">
            {cIcon && (
              <div className="w-6 h-6 rounded-md bg-muted/40 flex items-center justify-center shrink-0">
                <Icon name={cIcon} size={12} className="text-muted-foreground" />
              </div>
            )}
            <span className={cn(
              "text-foreground", 
              typeof row[col.id] === 'number' ? 'font-mono' : 'truncate max-w-[200px] block'
            )}>
              {row[col.id]}
            </span>
          </div>
        );
      }
    }));
  }, [columns]);

  const { table, dense, onChangeDense } = useTable({
    data: filteredData,
    columns: tanstackColumns,
    defaultRowsPerPage: 10,
  });

  if (data.length === 0) return null;

  return (
    <Card className="border-none shadow-sm overflow-hidden flex flex-col w-full bg-card">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-3 bg-muted/5">
        <h2 className="text-h6 text-foreground">Detalle de registros</h2>
        <div className="w-full sm:w-64">
          <Input 
            placeholder="Buscar..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            leftIcon={<Icon name="Search" size={16} />}
          />
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeadCustom table={table} />
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Icon name="AlertTriangle" size={24} className="mb-2 opacity-50" />
                    <p>No hay resultados que coincidan con la búsqueda.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/10 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
    </Card>
  );
}

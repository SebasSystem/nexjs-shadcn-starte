import { Table } from '@tanstack/react-table';
import { Icon } from 'src/shared/components/ui';

import { Switch } from 'src/shared/components/ui/switch';
import { Button } from 'src/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';

interface Props<TData> {
  table: Table<TData>;
  dense?: boolean;
  onChangeDense?: (checked: boolean) => void;
}

export function TablePaginationCustom<TData>({ table, dense, onChangeDense }: Props<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="flex flex-wrap-reverse items-center justify-between px-4 pt-3 pb-4 gap-2">
      {/* Switch compacto — primero en DOM, queda abajo al wrappear (wrap-reverse) */}
      {onChangeDense && (
        <div className="flex items-center space-x-2">
          <Switch id="dense-mode" checked={dense} onCheckedChange={onChangeDense} />
          <label htmlFor="dense-mode" className="text-sm font-normal leading-none cursor-pointer">
            Compacto
          </label>
        </div>
      )}

      {/* Controles de paginación — segundo en DOM, queda arriba al wrappear */}
      <div className="overflow-x-auto pr-0">
        <div className="flex items-center space-x-3 sm:space-x-6 lg:space-x-8 min-w-0">
          {/* Rows per page selector */}
          <div className="flex items-center space-x-1">
            <p className="text-sm font-normal">Filas por página:</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-auto border-0 bg-transparent shadow-none text-sm font-normal px-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 25, 50].map((ps) => (
                  <SelectItem key={ps} value={`${ps}`}>
                    {ps}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row range info */}
          <div className="text-sm font-normal whitespace-nowrap">
            {from}–{to} de {total}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Página anterior</span>
              <Icon name="ChevronLeft" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Página siguiente</span>
              <Icon name="ChevronRight" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

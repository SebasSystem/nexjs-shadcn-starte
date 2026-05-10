import { Table } from '@tanstack/react-table';
import { Icon } from 'src/shared/components/ui';
import { Button } from 'src/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';
import { Switch } from 'src/shared/components/ui/switch';
import { PER_PAGE_OPTIONS } from 'src/shared/lib/pagination';

interface Props<TData> {
  table: Table<TData>;
  dense?: boolean;
  onChangeDense?: (checked: boolean) => void;
  /** Server-side: total items from backend. Falls back to filtered row count if not provided. */
  total?: number;
}

export function TablePaginationCustom<TData>({ table, dense, onChangeDense, total }: Props<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalItems = total ?? table.getFilteredRowModel().rows.length;
  const from = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="flex flex-wrap-reverse items-center justify-between px-4 pt-3 pb-4 gap-2">
      {onChangeDense && (
        <div className="flex items-center space-x-2">
          <Switch id="dense-mode" checked={dense} onCheckedChange={onChangeDense} />
          <label htmlFor="dense-mode" className="text-sm font-normal leading-none cursor-pointer">
            Compacto
          </label>
        </div>
      )}

      <div className="overflow-x-auto pr-0">
        <div className="flex items-center space-x-3 sm:space-x-6 lg:space-x-8 min-w-0">
          <div className="flex items-center space-x-1">
            <p className="text-sm font-normal">Filas por página:</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-auto border-0 bg-transparent shadow-none focus:ring-0 focus:outline-none text-sm font-normal px-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {PER_PAGE_OPTIONS.map((ps) => (
                  <SelectItem key={ps} value={`${ps}`}>
                    {ps}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm font-normal whitespace-nowrap">
            {from}–{to} de {totalItems}
          </div>

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

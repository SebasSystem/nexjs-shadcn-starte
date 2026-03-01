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
  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Dense Switch */}
      <div className="flex-1">
        {onChangeDense && (
          <div className="flex items-center space-x-2">
            <Switch id="dense-mode" checked={dense} onCheckedChange={onChangeDense} />
            <label htmlFor="dense-mode" className="text-sm font-medium leading-none cursor-pointer">
              Dense
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current page info */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <Icon name="ChevronLeft" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <Icon name="ChevronRight" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

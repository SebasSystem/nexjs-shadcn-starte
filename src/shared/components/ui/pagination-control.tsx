import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

interface PaginationControlProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControl({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationControlProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground mt-6 px-1">
      <span>
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <Icon name="ChevronLeft" className="h-4 w-4" />
        </Button>
        <span className="font-medium text-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <Icon name="ChevronRight" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { TableCell, TableRow } from 'src/shared/components/ui/table';

interface Props {
  notFound: boolean;
  colSpan?: number;
}

export function TableNoData({ notFound, colSpan = 12 }: Props) {
  if (!notFound) return null;

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground w-full">
          <p className="text-sm">No data available</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

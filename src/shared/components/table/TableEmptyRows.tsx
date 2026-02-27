import { TableCell, TableRow } from 'src/shared/components/ui/table';

interface Props {
  emptyRows: number;
  height?: number; // 53px is typical height for standard standard rows, 33px for dense
}

export function TableEmptyRows({ emptyRows, height = 53 }: Props) {
  if (emptyRows <= 0) return null;

  return (
    <TableRow
      style={{
        height: height * emptyRows,
      }}
    >
      <TableCell colSpan={12} />
    </TableRow>
  );
}

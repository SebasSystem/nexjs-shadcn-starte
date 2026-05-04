'use client';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="py-3 px-4">
              <div
                className="h-4 bg-muted/50 rounded animate-pulse"
                style={{ width: `${60 + Math.random() * 35}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

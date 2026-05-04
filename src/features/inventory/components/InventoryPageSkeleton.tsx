'use client';

import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { Table, TableBody, TableContainer, TableSkeleton } from 'src/shared/components/table';
import { StatsCardSkeleton } from 'src/shared/components/ui';

interface Props {
  title: string;
  subtitle?: string;
}

export function InventoryPageSkeleton({ title, subtitle }: Props) {
  return (
    <PageContainer>
      <PageHeader title={title} subtitle={subtitle} />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Table card */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {/* Filters row */}
        <div className="flex gap-3 px-5 py-4 border-b border-border/40">
          <div className="h-9 flex-1 bg-muted/40 rounded-lg animate-pulse" />
          <div className="h-9 w-36 bg-muted/40 rounded-lg animate-pulse" />
          <div className="h-9 w-36 bg-muted/40 rounded-lg animate-pulse" />
        </div>

        <TableContainer>
          <Table>
            <TableBody emptyContent={false}>
              <TableSkeleton rows={8} columns={6} />
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PageContainer>
  );
}

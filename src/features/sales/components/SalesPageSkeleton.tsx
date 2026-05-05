'use client';

import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { Table, TableBody, TableContainer, TableSkeleton } from 'src/shared/components/table';
import { StatsCardSkeleton } from 'src/shared/components/ui';

interface Props {
  title: string;
  subtitle?: string;
  statsCount?: 0 | 2 | 4;
}

export function SalesPageSkeleton({ title, subtitle, statsCount = 0 }: Props) {
  return (
    <PageContainer>
      <PageHeader title={title} subtitle={subtitle} />

      {statsCount > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-${statsCount} gap-5`}>
          {Array.from({ length: statsCount }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <TableContainer>
          <Table>
            <TableBody emptyContent={false}>
              <TableSkeleton rows={8} columns={5} />
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PageContainer>
  );
}

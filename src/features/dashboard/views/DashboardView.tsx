'use client';

import Link from 'next/link';
import { paths } from 'src/routes/paths';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { Icon } from 'src/shared/components/ui';
import { Button } from 'src/shared/components/ui/button';

import { CarteraChart } from '../components/CarteraChart';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { LowStockTable } from '../components/LowStockTable';
import { OverdueTasksCard } from '../components/OverdueTasksCard';
import { RecentActivitiesList } from '../components/RecentActivitiesList';
import { RecentQuotationsTable } from '../components/RecentQuotationsTable';
import { SalesPerformanceChart } from '../components/SalesPerformanceChart';
import { useDashboard, useDashboardActivities } from '../hooks/use-dashboard';

export function DashboardView() {
  const { data, isLoading } = useDashboard();
  const { activities } = useDashboardActivities();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Descripción general del sistema"
        action={
          <Link href={paths.sales.pipeline}>
            <Button color="primary" size="sm">
              <Icon name="TrendingUp" size={15} />
              Ir al Pipeline Comercial
            </Button>
          </Link>
        }
      />

      <DashboardKpiCards data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <CarteraChart top_tags={data.top_tags} />
        <OverdueTasksCard summary={data.summary} overdue_tasks={data.overdue_tasks} />
      </div>

      <div className="mb-4">
        <SalesPerformanceChart monthly_sales={data.monthly_sales} />
      </div>

      <RecentActivitiesList activities={activities} />

      <LowStockTable low_stock_products={data.low_stock_products} />

      <RecentQuotationsTable recent_quotations={data.recent_quotations} />
    </PageContainer>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import {
  Icon,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from 'src/shared/components/table';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { cn } from 'src/lib/utils';
import { paths } from 'src/routes/paths';
import { PROJECT_STATUS_CONFIG } from 'src/_mock/_projects';
import { ProjectDrawer } from '../components/ProjectDrawer';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { useProjects } from '../hooks/useProjects';
import type { Project, ProjectStatus } from '../types';

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Project>();

// ─── Progress color ───────────────────────────────────────────────────────────

function getProgressColor(progress: number, status: ProjectStatus) {
  if (status === 'completed') return 'bg-success';
  if (status === 'cancelled') return 'bg-muted-foreground';
  if (progress <= 33) return 'bg-error';
  if (progress <= 66) return 'bg-warning';
  if (progress < 100) return 'bg-info';
  return 'bg-success';
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ProjectsView() {
  const router = useRouter();
  const { projects, stats, createProject, updateProject, cancelProject } = useProjects();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [projects, search, filterStatus]);

  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Proyecto',
        cell: (info) => (
          <div>
            <p className="text-subtitle2 text-foreground font-medium">{info.getValue()}</p>
            <p className="text-caption text-muted-foreground">{info.row.original.clientName}</p>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => <ProjectStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('manager', {
        header: 'Manager',
        cell: (info) => <span className="text-body2">{info.getValue()}</span>,
      }),
      columnHelper.accessor('startDate', {
        header: 'Inicio',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString('es', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        ),
      }),
      columnHelper.accessor('endDate', {
        header: 'Fin est.',
        cell: (info) => {
          const date = new Date(info.getValue());
          const isOverdue =
            date < new Date() &&
            info.row.original.status !== 'completed' &&
            info.row.original.status !== 'cancelled';
          return (
            <span
              className={cn(
                'text-body2',
                isOverdue ? 'text-error font-medium' : 'text-muted-foreground'
              )}
            >
              {date.toLocaleDateString('es', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          );
        },
      }),
      columnHelper.accessor('progress', {
        header: 'Progreso',
        cell: (info) => {
          const progress = info.getValue();
          const status = info.row.original.status;
          const colorClass = getProgressColor(progress, status);
          return (
            <div className="flex items-center gap-2 min-w-[100px]">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', colorClass)}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-caption text-muted-foreground shrink-0">{progress}%</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <button
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={() => router.push(paths.projects.detail(info.row.original.id))}
          >
            <Icon name="Eye" size={15} />
          </button>
        ),
      }),
    ],
    [router]
  );

  const { table, dense, onChangeDense } = useTable({
    data: filtered,
    columns: COLUMNS,
    defaultRowsPerPage: 15,
  });

  const statsCards = [
    {
      title: 'Proyectos activos',
      value: stats.active,
      trend: 'en curso o planificación',
      trendUp: true,
      icon: <Icon name="FolderKanban" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
    {
      title: 'Completados',
      value: stats.completed,
      trend: 'finalizados',
      trendUp: true,
      icon: <Icon name="CheckCircle" size={18} />,
      iconClassName: 'bg-success/10 text-success',
    },
    {
      title: 'En pausa',
      value: stats.onHold,
      trend: 'esperando acción',
      trendUp: false,
      icon: <Icon name="PauseCircle" size={18} />,
      iconClassName: 'bg-warning/10 text-warning',
    },
    {
      title: 'Hitos vencidos',
      value: stats.delayedMilestones,
      trend: 'requieren atención',
      trendUp: false,
      icon: <Icon name="AlertTriangle" size={18} />,
      iconClassName: 'bg-error/10 text-error',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Proyectos"
        subtitle="Implementaciones y onboarding post-venta"
        action={
          <Button
            color="primary"
            size="sm"
            onClick={() => {
              setSelectedProject(null);
              setDrawerMode('create');
              setDrawerOpen(true);
            }}
          >
            <Icon name="Plus" size={16} />
            Nuevo proyecto
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconClassName={card.iconClassName}
            trend={card.trend}
            trendUp={card.trendUp}
          />
        ))}
      </div>

      {/* Table */}
      <SectionCard noPadding>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="relative flex-1 min-w-48">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar por proyecto o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(PROJECT_STATUS_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TableContainer>
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.map((row) => {
                const hasDelayed = row.original.milestones.some((m) => m.status === 'delayed');
                const showAlert =
                  hasDelayed &&
                  row.original.status !== 'completed' &&
                  row.original.status !== 'cancelled';
                return (
                  <TableRow key={row.id} className={cn(showAlert && 'bg-error/5')}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      <ProjectDrawer
        open={drawerOpen}
        mode={drawerMode}
        project={selectedProject}
        onClose={() => setDrawerOpen(false)}
        onCreate={createProject}
        onUpdate={updateProject}
        onCancel={cancelProject}
      />
    </PageContainer>
  );
}

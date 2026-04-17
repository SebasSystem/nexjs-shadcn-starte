'use client';

import { useState, useMemo } from 'react';
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
  PageContainer,
  PageHeader,
  SectionCard,
  StatsCard,
} from 'src/shared/components/layouts/page';
import { MATERIAL_TYPE_CONFIG } from 'src/_mock/_partners';
import { MaterialCard } from '../components/MaterialCard';
import { MaterialUploadDrawer } from '../components/MaterialUploadDrawer';
import { usePartners } from '../hooks/usePartners';

// ─── Main View ────────────────────────────────────────────────────────────────

export function PartnerPortalView() {
  const { materials, materialStats, createMaterial } = usePartners();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch =
        !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchType = filterType === 'all' || m.type === filterType;
      return matchSearch && matchType;
    });
  }, [materials, search, filterType]);

  const statsCards = [
    {
      title: 'Total materiales',
      value: materialStats.total,
      trend: 'disponibles para partners',
      trendUp: true,
      icon: <Icon name="FolderOpen" size={18} />,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      title: 'Total descargas',
      value: materialStats.totalDownloads,
      trend: 'histórico acumulado',
      trendUp: true,
      icon: <Icon name="Download" size={18} />,
      iconClassName: 'bg-info/10 text-info',
    },
    {
      title: 'Última actualización',
      value:
        materialStats.lastUpdated !== '—'
          ? new Date(materialStats.lastUpdated).toLocaleDateString('es', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '—',
      trend: 'del portal',
      trendUp: true,
      icon: <Icon name="Clock" size={18} />,
      iconClassName: 'bg-secondary/10 text-secondary-foreground',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Portal de Partners"
        subtitle="Materiales de venta, capacitación y recursos para aliados comerciales"
        action={
          <Button color="primary" size="sm" onClick={() => setDrawerOpen(true)}>
            <Icon name="Upload" size={16} />
            Subir material
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Content */}
      <SectionCard>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Buscar por título o tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(MATERIAL_TYPE_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Icon name="FolderOpen" size={36} className="text-muted-foreground mb-3" />
            <p className="text-subtitle2 font-medium">Sin materiales</p>
            <p className="text-caption text-muted-foreground mt-1">
              No hay materiales que coincidan con los filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </SectionCard>

      <MaterialUploadDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpload={createMaterial}
      />
    </PageContainer>
  );
}

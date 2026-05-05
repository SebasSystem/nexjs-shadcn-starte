'use client';

import { useMemo, useState } from 'react';
import { PageContainer, PageHeader, StatsCard } from 'src/shared/components/layouts/page';
import { Button, Icon, Input, SelectField } from 'src/shared/components/ui';

import { BattlecardCard } from '../components/BattlecardCard';
import { BattlecardDrawer } from '../components/BattlecardDrawer';
import { useIntelligence } from '../hooks/useIntelligence';
import type { Battlecard, CompetitorTier } from '../types';
import { COMPETITOR_TIER_CONFIG } from '../types';

const TIER_OPTIONS = [
  { value: '', label: 'Todos los tiers' },
  ...Object.entries(COMPETITOR_TIER_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

export function BattlecardsView() {
  const { battlecards, stats, competitors, createBattlecard, updateBattlecard, deleteBattlecard } =
    useIntelligence();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Battlecard | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return battlecards.filter((bc) => {
      const matchesSearch =
        !q || bc.competitor_name.toLowerCase().includes(q) || bc.summary.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (tierFilter) {
        const competitor = competitors.find((c) => c.uid === bc.competitor_uid);
        return competitor?.tier === (tierFilter as CompetitorTier);
      }

      return true;
    });
  }, [battlecards, competitors, search, tierFilter]);

  const handleEdit = (bc: Battlecard) => {
    setEditing(bc);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Battlecards"
        subtitle={`${battlecards.length} competidores mapeados`}
        action={
          <Button color="primary" onClick={() => setDrawerOpen(true)}>
            <Icon name="Plus" size={16} />
            Nueva battlecard
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Competidores"
          value={stats.total_competitors}
          icon={<Icon name="Target" size={18} />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatsCard
          title="Win rate promedio"
          value={`${stats.avg_win_rate}%`}
          icon={<Icon name="TrendingUp" size={18} />}
          iconClassName="bg-success/10 text-success"
          trendUp={stats.avg_win_rate >= 50}
        />
        <StatsCard
          title="Mayor amenaza"
          value={stats.top_competitor}
          icon={<Icon name="Swords" size={18} />}
          iconClassName="bg-error/10 text-error"
        />
        <StatsCard
          title="Battlecards activas"
          value={battlecards.length}
          icon={<Icon name="FileText" size={18} />}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input
            label="Buscar"
            placeholder="Buscar competidor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="Search" size={15} />}
          />
        </div>
        <div className="min-w-[180px]">
          <SelectField
            label="Tier"
            options={TIER_OPTIONS}
            value={tierFilter}
            onChange={(v) => setTierFilter(v as string)}
            placeholder="Todos los tiers"
            clearable
          />
        </div>
      </div>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Icon name="Swords" size={26} className="text-muted-foreground" />
          </div>
          <p className="text-subtitle2 font-semibold text-foreground">Sin resultados</p>
          <p className="text-caption text-muted-foreground mt-1">
            Ajustá los filtros o creá una nueva battlecard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((bc) => (
            <BattlecardCard
              key={bc.uid}
              battlecard={bc}
              onEdit={handleEdit}
              onDelete={deleteBattlecard}
            />
          ))}
        </div>
      )}

      <BattlecardDrawer
        open={drawerOpen}
        item={editing}
        competitors={competitors}
        onClose={handleClose}
        onCreate={createBattlecard}
        onUpdate={updateBattlecard}
      />
    </PageContainer>
  );
}

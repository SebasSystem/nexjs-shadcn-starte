import React, { useState } from 'react';
import {
  Icon,
  Button,
  Input,
  SelectField,
} from 'src/shared/components/ui';
import { SectionCard } from 'src/shared/components/layouts/page';
import { cn } from 'src/lib/utils';
import { MOCK_CATEGORIES } from 'src/_mock/_inventories';

export function ReportFilters() {
  const [expanded, setExpanded] = useState(true);
  const [period, setPeriod] = useState('Este mes');
  const [warehouse, setWarehouse] = useState('all');
  const [category, setCategory] = useState('all');

  const showCustomDate = period === 'Personalizado';
  const hasFilters = period !== 'Este mes' || warehouse !== 'all' || category !== 'all';

  const handleClear = () => {
    setPeriod('Este mes');
    setWarehouse('all');
    setCategory('all');
  };

  if (!expanded) {
    return (
      <div className="flex justify-end mt-4 lg:mt-0">
        <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
          <span className="mr-2">Mostrar filtros</span> <Icon name="ChevronDown" size={16} />
        </Button>
      </div>
    );
  }

  return (
    <SectionCard className="mt-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-1">
        <p className="text-subtitle2 font-bold text-foreground flex items-center gap-2">
          <Icon name="SlidersHorizontal" size={16} /> Filtros de reporte
        </p>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-error h-8 px-2"
            >
              <Icon name="RefreshCcw" size={14} className="mr-1.5" /> Limpiar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
            className="h-8 w-8 p-0"
          >
            <Icon name="ChevronUp" size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Período */}
        <div className="md:col-span-6 flex flex-col gap-2">
          <p className="text-caption font-semibold text-muted-foreground">Período</p>
          <div className="flex flex-wrap items-center gap-2">
            {['Hoy', 'Esta semana', 'Este mes', 'Este trimestre', 'Personalizado'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 text-caption font-semibold rounded-lg transition-colors border',
                  period === p
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/10 border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {showCustomDate && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                <Input type="date" leftIcon={<Icon name="CalendarDays" size={14} />} />
              </div>
              <span className="text-muted-foreground">—</span>
              <div className="flex-1">
                <Input type="date" leftIcon={<Icon name="CalendarDays" size={14} />} />
              </div>
            </div>
          )}
        </div>

        {/* Bodega */}
        <div className="md:col-span-3">
          <SelectField
            label="Bodega"
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'main', label: 'Bodega Principal' },
              { value: 'store', label: 'Tienda' },
            ]}
            value={warehouse}
            onChange={(v) => setWarehouse(v as string)}
          />
        </div>

        {/* Categoría */}
        <div className="md:col-span-3">
          <SelectField
            label="Categoría"
            options={[
              { value: 'all', label: 'Todas las categorías' },
              ...MOCK_CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={category}
            onChange={(v) => setCategory(v as string)}
          />
        </div>
      </div>
    </SectionCard>
  );
}

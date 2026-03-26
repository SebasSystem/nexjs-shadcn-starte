import React, { useState } from 'react';
import {
  Icon,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from 'src/shared/components/ui';
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
    <div className="w-full bg-card border border-border/50 rounded-xl mt-4 p-4 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
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
          <label className="text-caption font-semibold text-muted-foreground">Período</label>
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
        <div className="md:col-span-3 flex flex-col gap-2">
          <label className="text-caption font-semibold text-muted-foreground">Bodega</label>
          <Select value={warehouse} onValueChange={setWarehouse}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Seleccione bodega" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="main">Bodega Principal</SelectItem>
              <SelectItem value="store">Tienda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoría */}
        <div className="md:col-span-3 flex flex-col gap-2">
          <label className="text-caption font-semibold text-muted-foreground">Categoría</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Seleccione categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {MOCK_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

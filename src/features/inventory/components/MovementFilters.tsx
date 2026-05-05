import { Icon, Input, SelectField } from 'src/shared/components/ui';

interface MovementFiltersProps {
  search: string;
  onSearch: (v: string) => void;
  filterType: string;
  onFilterType: (v: string) => void;
}

export function MovementFilters({
  search,
  onSearch,
  filterType,
  onFilterType,
}: MovementFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="flex-1 min-w-48">
        <Input
          label="Buscar"
          placeholder="Buscar por producto, referencia..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          leftIcon={<Icon name="Search" size={15} />}
        />
      </div>
      <SelectField
        label="Tipo"
        options={[
          { value: 'all', label: 'Todos los tipos' },
          { value: 'transfer', label: 'Traslados' },
          { value: 'adjustment_in', label: 'Ajuste entrada' },
          { value: 'adjustment_out', label: 'Ajuste salida' },
          { value: 'reservation', label: 'Reservas' },
          { value: 'reservation_release', label: 'Liberaciones' },
          { value: 'reservation_consume', label: 'Consumos' },
        ]}
        value={filterType}
        onChange={(v) => onFilterType(v as string)}
      />
    </div>
  );
}

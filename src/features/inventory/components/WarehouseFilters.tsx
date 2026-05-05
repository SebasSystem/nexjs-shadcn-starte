import { Icon, Input, SelectField } from 'src/shared/components/ui';

interface WarehouseFiltersProps {
  search: string;
  onSearch: (v: string) => void;
  filterStock: string;
  onFilterStock: (v: string) => void;
}

export function WarehouseFilters({
  search,
  onSearch,
  filterStock,
  onFilterStock,
}: WarehouseFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="flex-1 min-w-48">
        <Input
          label="Buscar"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          leftIcon={<Icon name="Search" size={15} />}
        />
      </div>
      <SelectField
        label="Stock"
        options={[
          { value: 'all', label: 'Todas las bodegas' },
          { value: 'with_stock', label: 'Solo con stock' },
        ]}
        value={filterStock}
        onChange={(v) => onFilterStock(v as string)}
      />
    </div>
  );
}

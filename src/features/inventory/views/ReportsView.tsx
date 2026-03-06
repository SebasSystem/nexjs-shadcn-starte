'use client';

import React, { useState, useMemo } from 'react';
import {
  Icon,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'src/shared/components/ui';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  SectionCardHeader,
} from 'src/shared/components/layouts/page';
import { cn } from 'src/lib/utils';
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  getProductStockStatus,
  getProductAvailable,
} from 'src/_mock/_inventories';
import { StockBadge } from '../components/StockBadge';

// ─── Tab 1: Category Summary ──────────────────────────────────────────────────

type CategoryRow = {
  category: string;
  count: number;
  totalStock: number;
  available: number;
  reserved: number;
  outOfStock: number;
  lowStock: number;
};

function buildCategoryRows(): CategoryRow[] {
  return MOCK_CATEGORIES.map((cat) => {
    const products = MOCK_PRODUCTS.filter((p) => p.category === cat.name);
    return {
      category: cat.name,
      count: products.length,
      totalStock: products.reduce((s, p) => s + p.stockMain + p.stockStore, 0),
      available: products.reduce((s, p) => s + getProductAvailable(p), 0),
      reserved: products.reduce((s, p) => s + p.reserved, 0),
      outOfStock: products.filter((p) => getProductStockStatus(p) === 'out_of_stock').length,
      lowStock: products.filter((p) => getProductStockStatus(p) === 'low_stock').length,
    };
  });
}

function CategoryTab() {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const rows = useMemo(() => buildCategoryRows(), []);

  return (
    <div className="space-y-4">
      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-xs font-medium">
                <th className="text-left px-5 py-3">Categoría</th>
                <th className="text-right px-5 py-3">Nº productos</th>
                <th className="text-right px-5 py-3">Stock total</th>
                <th className="text-right px-5 py-3">Disponible</th>
                <th className="text-right px-5 py-3">Reservado</th>
                <th className="text-right px-5 py-3">Sin stock</th>
                <th className="text-right px-5 py-3">Stock bajo</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isOpen = expandedCat === row.category;
                const products = MOCK_PRODUCTS.filter((p) => p.category === row.category);
                return (
                  <React.Fragment key={row.category}>
                    <tr
                      className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedCat(isOpen ? null : row.category)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Icon
                            name={isOpen ? 'ChevronUp' : 'ChevronDown'}
                            size={14}
                            className="text-muted-foreground"
                          />
                          <span className="font-medium text-foreground">{row.category}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground">{row.count}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                        {row.totalStock}
                      </td>
                      <td className="px-5 py-3.5 text-right text-success font-semibold">
                        {row.available}
                      </td>
                      <td className="px-5 py-3.5 text-right text-info">{row.reserved}</td>
                      <td className="px-5 py-3.5 text-right">
                        {row.outOfStock > 0 ? (
                          <span className="text-error font-semibold">{row.outOfStock}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {row.lowStock > 0 ? (
                          <span className="text-warning font-semibold">{row.lowStock}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5" />
                    </tr>

                    {/* Expanded product rows */}
                    {isOpen &&
                      products.map((p) => (
                        <tr key={p.id} className="border-b border-border/30 bg-muted/10">
                          <td className="px-5 py-2.5 pl-12">
                            <p className="text-subtitle2 text-foreground">{p.name}</p>
                            <p className="text-caption text-muted-foreground font-mono">{p.sku}</p>
                          </td>
                          <td className="px-5 py-2.5 text-right text-muted-foreground">—</td>
                          <td className="px-5 py-2.5 text-right font-medium text-foreground">
                            {p.stockMain + p.stockStore}
                          </td>
                          <td className="px-5 py-2.5 text-right text-success">
                            {getProductAvailable(p)}
                          </td>
                          <td className="px-5 py-2.5 text-right text-info">{p.reserved}</td>
                          <td className="px-5 py-2.5 text-right" colSpan={3}>
                            <StockBadge status={getProductStockStatus(p)} />
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab 2: At-Risk Products ──────────────────────────────────────────────────

function RiskTab() {
  const riskProducts = MOCK_PRODUCTS.filter((p) => {
    const s = getProductStockStatus(p);
    return s === 'out_of_stock' || s === 'low_stock';
  });

  const noStock = riskProducts.filter((p) => getProductStockStatus(p) === 'out_of_stock').length;
  const lowStock = riskProducts.filter((p) => getProductStockStatus(p) === 'low_stock').length;
  const onlyOneWarehouse = MOCK_PRODUCTS.filter((p) => p.stockMain > 0 !== p.stockStore > 0).length;
  const totalProducts = MOCK_PRODUCTS.length;
  const pctNoStock = totalProducts > 0 ? Math.round((noStock / totalProducts) * 100) : 0;
  const pctLowStock = totalProducts > 0 ? Math.round((lowStock / totalProducts) * 100) : 0;
  const pctOneWarehouse =
    totalProducts > 0 ? Math.round((onlyOneWarehouse / totalProducts) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Sin stock',
            value: noStock,
            badge: `${pctNoStock}% del total`,
            badgeClass: 'bg-error/10 text-error',
            iconName: 'XCircle' as const,
            iconClassName: 'bg-error/10 text-error',
          },
          {
            title: 'Bajo mínimo',
            value: lowStock,
            badge: `${pctLowStock}% del total`,
            badgeClass: 'bg-warning/10 text-warning',
            iconName: 'AlertTriangle' as const,
            iconClassName: 'bg-warning/10 text-warning',
          },
          {
            title: 'Solo en una bodega',
            value: onlyOneWarehouse,
            badge: `${pctOneWarehouse}% del total`,
            badgeClass: 'bg-info/10 text-info',
            iconName: 'Warehouse' as const,
            iconClassName: 'bg-info/10 text-info',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-card rounded-2xl px-5 py-4 shadow-card hover:shadow-card-hover transition-shadow duration-300"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('p-2 rounded-xl shrink-0', card.iconClassName)}>
                  <Icon name={card.iconName} size={18} />
                </div>
                <p className="text-[1.75rem] font-bold text-foreground leading-none tabular-nums">
                  {card.value}
                </p>
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap mt-0.5',
                  card.badgeClass
                )}
              >
                {card.badge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
          </div>
        ))}
      </div>

      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-xs font-medium">
                <th className="text-left px-5 py-3">Producto</th>
                <th className="text-right px-5 py-3">Stock actual</th>
                <th className="text-right px-5 py-3">Stock mínimo</th>
                <th className="text-right px-5 py-3">Déficit</th>
                <th className="text-right px-5 py-3">Reservado B2B</th>
                <th className="text-right px-5 py-3">Disponible real</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {riskProducts.map((p) => {
                const total = p.stockMain + p.stockStore;
                const available = getProductAvailable(p);
                const deficit = Math.max(0, p.minStock - total);
                const status = getProductStockStatus(p);

                return (
                  <tr
                    key={p.id}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            status === 'out_of_stock' ? 'bg-error' : 'bg-warning'
                          )}
                        />
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-caption text-muted-foreground font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                      {total}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">{p.minStock}</td>
                    <td className="px-5 py-3.5 text-right">
                      {deficit > 0 ? (
                        <span className="text-error font-bold">−{deficit}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-info">{p.reserved}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={cn('font-bold', available <= 0 ? 'text-error' : 'text-warning')}
                      >
                        {available}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StockBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab 3: Exports ───────────────────────────────────────────────────────────

const EXPORT_OPTIONS = [
  {
    id: 'full',
    label: 'Inventario completo actual',
    desc: 'Todos los productos con stock actual',
    columns: [
      'Producto',
      'SKU',
      'Categoría',
      'B. Principal',
      'Tienda',
      'Reservado',
      'Disponible',
      'Estado',
    ],
  },
  {
    id: 'by_category',
    label: 'Productos por categoría',
    desc: 'Agrupado por categorías',
    columns: ['Categoría', 'Producto', 'SKU', 'Stock total', 'Disponible'],
  },
  {
    id: 'risk',
    label: 'Productos en riesgo',
    desc: 'Solo productos con stock bajo o sin stock',
    columns: ['Producto', 'SKU', 'Stock actual', 'Stock mínimo', 'Déficit', 'Estado'],
  },
  {
    id: 'stock_by_warehouse',
    label: 'Stock disponible por bodega',
    desc: 'Desglose de stock por cada bodega',
    columns: ['Producto', 'SKU', 'B. Principal', 'Tienda', 'Total'],
  },
];

function ExportsTab() {
  const [selectedExport, setSelectedExport] = useState('full');
  const option = EXPORT_OPTIONS.find((o) => o.id === selectedExport)!;

  const handleDownload = () => {
    // Mock download: just show a success message toast (in real app would trigger download)
    alert(`Archivo CSV "${option.label}" generado correctamente`);
  };

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionCardHeader
          title="Configurar exportación"
          subtitle="Selecciona el tipo de reporte a generar"
        />

        <div className="space-y-3">
          {EXPORT_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                selectedExport === opt.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border/60 hover:border-primary/40'
              )}
            >
              <input
                type="radio"
                name="export-type"
                value={opt.id}
                checked={selectedExport === opt.id}
                onChange={() => setSelectedExport(opt.id)}
                className="mt-0.5"
              />
              <div>
                <p className="text-subtitle2 font-medium text-foreground">{opt.label}</p>
                <p className="text-caption text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Column preview */}
        <div className="mt-5">
          <p className="text-caption text-muted-foreground mb-2 font-medium">
            Columnas que incluirá el archivo:
          </p>
          <div className="flex flex-wrap gap-2">
            {option.columns.map((col) => (
              <Badge key={col} variant="soft" color="secondary">
                {col}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Button color="primary" onClick={handleDownload}>
            <Icon name="Download" size={16} />
            Descargar CSV
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ReportsView() {
  return (
    <PageContainer>
      <PageHeader
        title="Reportes de Inventario"
        subtitle="Generación y consulta de reportes para toma de decisiones"
      />

      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Resumen por Categoría</TabsTrigger>
          <TabsTrigger value="risk">Productos en Riesgo</TabsTrigger>
          <TabsTrigger value="exports">Exportaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoryTab />
        </TabsContent>

        <TabsContent value="risk">
          <RiskTab />
        </TabsContent>

        <TabsContent value="exports">
          <ExportsTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

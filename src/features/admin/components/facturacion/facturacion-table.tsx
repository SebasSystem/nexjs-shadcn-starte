'use client';

import { useState } from 'react';
import { Eye, AlertCircle, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { FacturaStatusBadge } from 'src/features/admin/components/facturacion/factura-status-badge';
import { Factura } from 'src/features/admin/types/admin.types';

interface FacturacionTableProps {
  facturas: Factura[];
  onViewDetail: (factura: Factura) => void;
  onMarcarPagadas: (ids: string[]) => Promise<void>;
}

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isVencida(dateStr: string) {
  return new Date(dateStr) < new Date();
}

export function FacturacionTable({
  facturas,
  onViewDetail,
  onMarcarPagadas,
}: FacturacionTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleAll = () => {
    if (selected.length === facturas.length) {
      setSelected([]);
    } else {
      setSelected(facturas.map((f) => f.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleMarcarPagadas = async () => {
    setIsProcessing(true);
    try {
      await onMarcarPagadas(selected);
      setSelected([]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (facturas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileText className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron facturas con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              <th className="py-3 px-4 w-[4%]">
                <input
                  type="checkbox"
                  checked={selected.length === facturas.length && facturas.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[20%]">
                Tenant
              </th>
              <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
                Periodo
              </th>
              <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
                Plan
              </th>
              <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
                Monto
              </th>
              <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
                Emisión
              </th>
              <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
                Vencimiento
              </th>
              <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
                Estado
              </th>
              <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => {
              const vencidaDate =
                isVencida(factura.fechaVencimiento) && factura.estado !== 'PAGADA';
              return (
                <tr
                  key={factura.id}
                  className="border-b border-border/20 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => onViewDetail(factura)}
                >
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(factura.id)}
                      onChange={() => toggleOne(factura.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                          {getInitials(factura.tenantNombre)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground text-body2 truncate">
                        {factura.tenantNombre}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-body2 text-muted-foreground">{factura.periodo}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">
                      {factura.planNombre}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">
                    ${factura.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-body2 text-muted-foreground">
                    {formatDate(factura.fechaEmision)}
                  </td>
                  <td className="py-3 px-4">
                    {vencidaDate ? (
                      <span className="flex items-center gap-1 text-red-600 font-semibold text-body2">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formatDate(factura.fechaVencimiento)}
                      </span>
                    ) : (
                      <span className="text-body2 text-muted-foreground">
                        {formatDate(factura.fechaVencimiento)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <FacturaStatusBadge estado={factura.estado} />
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onViewDetail(factura)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-foreground text-background rounded-2xl px-6 py-3 shadow-xl">
          <span className="text-body2 font-medium">
            {selected.length}{' '}
            {selected.length === 1 ? 'factura seleccionada' : 'facturas seleccionadas'}
          </span>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={handleMarcarPagadas}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Marcar como Pagadas'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-background hover:text-background hover:bg-white/10"
            onClick={() => setSelected([])}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}

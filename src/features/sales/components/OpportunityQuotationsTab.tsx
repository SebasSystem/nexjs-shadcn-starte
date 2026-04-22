'use client';

import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, Plus } from 'lucide-react';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { paths } from 'src/routes/paths';
import { useSalesContext } from '../context/SalesContext';
import type { Opportunity } from '../types/sales.types';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  borrador: 'default',
  enviada: 'info',
  aprobada: 'success',
  rechazada: 'error',
  convertida: 'success',
};

const STATUS_LABEL: Record<string, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  convertida: 'Convertida',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface OpportunityQuotationsTabProps {
  opportunity: Opportunity;
}

export function OpportunityQuotationsTab({ opportunity }: OpportunityQuotationsTabProps) {
  const router = useRouter();
  const { quotations } = useSalesContext();
  const linked = quotations.filter((q) => q.opportunityId === opportunity.id);
  const isTerminal =
    opportunity.stage === 'cerrado-ganado' || opportunity.stage === 'cerrado-perdido';

  return (
    <div className="space-y-3">
      {linked.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center">
            <FileText size={22} className="text-muted-foreground" />
          </div>
          <p className="text-body2 text-muted-foreground">Sin cotizaciones aún</p>
          {!isTerminal && (
            <Button
              size="sm"
              color="primary"
              onClick={() => router.push(paths.sales.quotation(opportunity.id))}
            >
              <Plus size={14} />
              Crear cotización
            </Button>
          )}
        </div>
      ) : (
        <>
          {linked.map((q) => {
            const total = q.products.reduce(
              (sum, p) => sum + p.unitPrice * p.qty * (1 - p.discount / 100),
              0
            );
            return (
              <div
                key={q.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body2 font-bold text-foreground font-mono">{q.id}</span>
                    <Badge variant="soft" color={STATUS_COLOR[q.status] ?? 'default'}>
                      {STATUS_LABEL[q.status]}
                    </Badge>
                  </div>
                  <span className="text-caption text-muted-foreground">{q.date}</span>
                  <span className="text-caption font-semibold text-foreground">
                    {formatCurrency(total)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(paths.sales.quotation(q.id))}
                >
                  Ver
                  <ArrowRight size={13} />
                </Button>
              </div>
            );
          })}
          {!isTerminal && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(paths.sales.quotation(opportunity.id))}
            >
              <Plus size={14} />
              Nueva cotización
            </Button>
          )}
        </>
      )}
    </div>
  );
}

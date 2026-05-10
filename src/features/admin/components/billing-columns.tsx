'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { BillingStatusBadge } from 'src/features/admin/components/billing-status-badge';
import { Factura } from 'src/features/admin/types/admin.types';
import { formatMoney } from 'src/lib/currency';
import { toDate } from 'src/lib/date';
import { formatDate as formatDateLib } from 'src/lib/date';
import { ViewButton } from 'src/shared/components/ui/action-buttons';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Icon } from 'src/shared/components/ui/icon';

function getInitials(nombre: string) {
  return (nombre ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatDate(dateStr: string) {
  return formatDateLib(dateStr);
}

function isVencida(dateStr: string) {
  return toDate(dateStr) < new Date();
}

const columnHelper = createColumnHelper<Factura>();

export interface BillingColumnHandlers {
  selected: string[];
  facturas: Factura[];
  onViewDetail: (factura: Factura) => void;
  toggleOne: (id: string) => void;
  toggleAll: () => void;
}

export function buildBillingColumns({
  selected,
  facturas,
  onViewDetail,
  toggleOne,
  toggleAll,
}: BillingColumnHandlers) {
  return [
    columnHelper.display({
      id: 'selection',
      header: () => (
        <input
          type="checkbox"
          checked={selected.length === facturas.length && facturas.length > 0}
          onChange={toggleAll}
          className="rounded"
        />
      ),
      cell: (info) => {
        const factura = info.row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selected.includes(factura.uid)}
              onChange={() => toggleOne(factura.uid)}
              className="rounded"
            />
          </div>
        );
      },
    }),
    columnHelper.accessor('tenant_nombre', {
      header: 'Tenant',
      cell: (info) => {
        const name = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground text-body2 truncate">{name}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('periodo', {
      header: 'Periodo',
      cell: (info) => <span className="text-body2 text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor('plan_nombre', {
      header: 'Plan',
      cell: (info) => (
        <Badge variant="outline" className="text-xs">
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('total', {
      header: 'Monto',
      cell: (info) => (
        <span className="font-semibold text-foreground">
          {formatMoney(info.getValue(), {
            scope: 'platform',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    }),
    columnHelper.accessor('issued_at', {
      header: 'Emisión',
      cell: (info) => (
        <span className="text-body2 text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor('due_at', {
      header: 'Vencimiento',
      cell: (info) => {
        const factura = info.row.original;
        const vencidaDate = isVencida(factura.due_at) && factura.status !== 'PAGADA';
        if (vencidaDate) {
          return (
            <span className="flex items-center gap-1 text-red-600 font-semibold text-body2">
              <Icon name="AlertCircle" className="h-3.5 w-3.5" />
              {formatDate(factura.due_at)}
            </span>
          );
        }
        return (
          <span className="text-body2 text-muted-foreground">{formatDate(factura.due_at)}</span>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Estado',
      cell: (info) => <BillingStatusBadge estado={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: (info) => {
        const factura = info.row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ViewButton onClick={() => onViewDetail(factura)} />
          </div>
        );
      },
    }),
  ];
}

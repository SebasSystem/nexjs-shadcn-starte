'use client';

import { useState } from 'react';
import { Eye, Pencil, MoreHorizontal, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { TenantStatusBadge } from 'src/features/admin/components/tenants/tenant-status-badge';
import { Tenant } from 'src/features/admin/types/admin.types';

interface TenantsTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onViewDetail: (tenant: Tenant) => void;
  onSuspend: (tenant: Tenant) => void;
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

function formatRelative(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return 'Hace menos de 1h';
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Hace ${diffD}d`;
  return `Hace ${Math.floor(diffD / 30)} mes(es)`;
}

function getUserProgressColor(pct: number) {
  if (pct > 95) return 'bg-red-500';
  if (pct > 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function TenantsTable({ tenants, onEdit, onViewDetail, onSuspend }: TenantsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <UserCheck className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron tenants con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[24%]">
              Tenant
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[13%]">
              Plan
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[13%]">
              Usuarios
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
              MRR
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
              Creado
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
              Último acceso
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[8%]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => {
            const userPct = Math.round((tenant.totalUsuarios / tenant.limiteUsuarios) * 100);
            const progressColor = getUserProgressColor(userPct);
            const isHovered = hoveredRow === tenant.id;

            return (
              <tr
                key={tenant.id}
                className="border-b border-border/20 hover:bg-muted/40 cursor-pointer transition-colors"
                onClick={() => onViewDetail(tenant)}
                onMouseEnter={() => setHoveredRow(tenant.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                        {getInitials(tenant.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-body2">{tenant.nombre}</p>
                      <p className="text-caption text-muted-foreground">{tenant.dominio}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="text-xs">
                    {tenant.planNombre}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <p className="text-body2 text-foreground font-medium mb-1">
                    {tenant.totalUsuarios} / {tenant.limiteUsuarios}
                  </p>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${progressColor}`}
                      style={{ width: `${Math.min(userPct, 100)}%` }}
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-foreground">${tenant.mrr}</span>
                </td>
                <td className="py-3 px-4">
                  <TenantStatusBadge estado={tenant.estado} />
                </td>
                <td className="py-3 px-4">
                  <span className="text-body2 text-muted-foreground">
                    {formatDate(tenant.creadoEn)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-body2 text-muted-foreground">
                    {formatRelative(tenant.ultimoAcceso)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div
                    className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onViewDetail(tenant)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEdit(tenant)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(tenant)}>
                          Cambiar Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onSuspend(tenant)}
                        >
                          Suspender Tenant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

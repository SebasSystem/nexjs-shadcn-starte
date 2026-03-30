'use client';

import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Pencil,
  Users,
  HardDrive,
  Zap,
  HeadphonesIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'src/shared/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { PlanSaaS, TierPlan } from 'src/features/admin/types/admin.types';

interface PlanCardProps {
  plan: PlanSaaS;
  onEdit: (plan: PlanSaaS) => void;
}

const tierConfig: Record<TierPlan, { border: string; badgeClass: string; label: string }> = {
  STARTER: {
    border: 'border-t-4 border-t-gray-400',
    badgeClass: 'bg-gray-100 text-gray-600 border-transparent',
    label: 'Starter',
  },
  PRO: {
    border: 'border-t-4 border-t-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 border-transparent',
    label: 'Pro',
  },
  BUSINESS: {
    border: 'border-t-4 border-t-purple-500',
    badgeClass: 'bg-purple-100 text-purple-700 border-transparent',
    label: 'Business',
  },
  ENTERPRISE: {
    border: 'border-t-4 border-t-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 border-transparent',
    label: 'Enterprise',
  },
};

const soporteLabel: Record<string, string> = {
  EMAIL: 'Solo Email',
  EMAIL_CHAT: 'Email + Chat',
  DEDICADO: 'Soporte Dedicado',
};

const moduloLabel: Record<string, string> = {
  ventas: 'Ventas',
  inventario: 'Inventario',
  rh: 'RH / Comisiones',
  reportes: 'Reportes',
  'multi-currency': 'Multi-currency',
  'api-publica': 'API Pública',
};

export function PlanCard({ plan, onEdit }: PlanCardProps) {
  const router = useRouter();
  const config = tierConfig[plan.tier];

  return (
    <div className={`bg-card rounded-2xl shadow-card overflow-hidden ${config.border}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="soft" className={config.badgeClass}>
              {config.label}
            </Badge>
            {plan.estado !== 'ACTIVO' && (
              <Badge
                variant="soft"
                className="bg-gray-100 text-gray-500 border-transparent text-xs"
              >
                {plan.estado}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(plan)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(plan)}>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Desactivar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h3 className="text-h6 font-bold text-foreground">{plan.nombre}</h3>
        <p className="text-body2 text-muted-foreground mb-4">
          <span className="text-2xl font-bold text-foreground">${plan.precio}</span> / mes por
          tenant
        </p>

        {/* Features Accordion */}
        <Accordion type="single" collapsible defaultValue="features">
          <AccordionItem value="features" className="border-0">
            <AccordionTrigger className="py-2 text-body2 font-semibold text-foreground hover:no-underline">
              Características incluidas
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-body2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Usuarios:</span>
                  <span className="font-medium text-foreground">
                    {plan.features.limiteUsuarios === null
                      ? 'Ilimitados'
                      : `hasta ${plan.features.limiteUsuarios}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-body2">
                  <HardDrive className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Almacenamiento:</span>
                  <span className="font-medium text-foreground">
                    {plan.features.almacenamientoGB === null
                      ? 'Ilimitado'
                      : `${plan.features.almacenamientoGB} GB`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-body2">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">API calls/mes:</span>
                  <span className="font-medium text-foreground">
                    {plan.features.apiCallsMes === null
                      ? 'Ilimitadas'
                      : plan.features.apiCallsMes >= 1000000
                        ? `${(plan.features.apiCallsMes / 1000000).toFixed(0)}M`
                        : `${(plan.features.apiCallsMes / 1000).toFixed(0)}k`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-body2">
                  <HeadphonesIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Soporte:</span>
                  <span className="font-medium text-foreground">
                    {soporteLabel[plan.features.soporte]}
                  </span>
                </div>

                {/* Modules */}
                <div className="pt-1">
                  <p className="text-caption font-semibold text-muted-foreground mb-1.5">
                    Módulos:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.modulos.map((m) => (
                      <Badge key={m} variant="outline" className="text-xs">
                        {moduloLabel[m] || m}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Booleans */}
                <div className="grid grid-cols-2 gap-1 pt-1">
                  <div className="flex items-center gap-1.5 text-caption">
                    {plan.features.customDomain ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                    <span className="text-muted-foreground">Custom Domain</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-caption">
                    {plan.features.sso ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                    <span className="text-muted-foreground">SSO</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-caption">
                    {plan.features.reportesAvanzados ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                    <span className="text-muted-foreground">Reportes avanzados</span>
                  </div>
                  {plan.features.slaUptime && (
                    <div className="flex items-center gap-1.5 text-caption">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-muted-foreground">SLA {plan.features.slaUptime}%</span>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Footer */}
        <div className="border-t border-border/40 pt-4 mt-3">
          <p className="text-body2 text-muted-foreground mb-2">
            <span className="font-semibold text-foreground">{plan.totalTenants}</span> tenants
            activos
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => router.push('/admin/tenants')}
          >
            Ver tenants →
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AlertTriangle, Users, DollarSign, Calendar, HardDrive, Zap } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import { Button } from 'src/shared/components/ui/button';
import { Badge } from 'src/shared/components/ui/badge';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'src/shared/components/ui/tabs';
import { Progress } from 'src/shared/components/ui/progress';
import { TenantStatusBadge } from 'src/features/admin/components/tenants/tenant-status-badge';
import { Tenant } from 'src/features/admin/types/admin.types';

interface TenantDetailDrawerProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
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

function getDaysSince(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

const MOCK_USERS = [
  {
    nombre: 'Ana García',
    email: 'ana@acme.com',
    rol: 'Admin',
    ultimoAcceso: 'Hace 2h',
    estado: 'Activo',
  },
  {
    nombre: 'Luis Torres',
    email: 'luis@acme.com',
    rol: 'Editor',
    ultimoAcceso: 'Hace 1d',
    estado: 'Activo',
  },
  {
    nombre: 'María López',
    email: 'maria@acme.com',
    rol: 'Viewer',
    ultimoAcceso: 'Hace 3d',
    estado: 'Inactivo',
  },
];

const MOCK_FACTURAS_TENANT = [
  { periodo: 'Marzo 2025', monto: '$172.84', estado: 'PAGADA' as const, vencimiento: '31/03/2025' },
  {
    periodo: 'Febrero 2025',
    monto: '$172.84',
    estado: 'PAGADA' as const,
    vencimiento: '28/02/2025',
  },
  {
    periodo: 'Enero 2025',
    monto: '$172.84',
    estado: 'PENDIENTE' as const,
    vencimiento: '31/01/2025',
  },
];

const MOCK_ACTIVIDAD = [
  { timestamp: '2025-03-24 10:32', evento: 'Inicio de sesión: admin@acme.com' },
  { timestamp: '2025-03-24 09:15', evento: 'Producto creado: SKU-12345' },
  { timestamp: '2025-03-23 16:00', evento: 'Reporte exportado: inventario_marzo.csv' },
  { timestamp: '2025-03-22 11:20', evento: 'Usuario invitado: nuevo@acme.com' },
  { timestamp: '2025-03-21 08:45', evento: 'Factura #INV-2025-0005 marcada como pagada' },
];

const estadoBadgeColor: Record<string, string> = {
  PAGADA: 'bg-emerald-100 text-emerald-700 border-transparent',
  PENDIENTE: 'bg-amber-100 text-amber-700 border-transparent',
  VENCIDA: 'bg-red-100 text-red-700 border-transparent',
  CANCELADA: 'bg-gray-100 text-gray-400 border-transparent',
};

export function TenantDetailDrawer({
  tenant,
  isOpen,
  onClose,
  onSuspend,
}: TenantDetailDrawerProps) {
  const [confirmandoSuspension, setConfirmandoSuspension] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState('');

  if (!tenant) return null;

  const userPct = Math.round((tenant.totalUsuarios / tenant.limiteUsuarios) * 100);
  const storagePct = Math.round(
    (tenant.almacenamientoUsadoGB / tenant.limiteAlmacenamientoGB) * 100
  );
  const apiPct = 60; // mock
  const dias = getDaysSince(tenant.creadoEn);

  const handleClose = () => {
    setConfirmandoSuspension(false);
    setTextoConfirmacion('');
    onClose();
  };

  const handleSuspend = () => {
    onSuspend(tenant);
    setConfirmandoSuspension(false);
    setTextoConfirmacion('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-[520px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/40">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="text-sm bg-blue-100 text-blue-700 font-bold">
                {getInitials(tenant.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-h6 truncate">{tenant.nombre}</SheetTitle>
              <SheetDescription className="text-caption text-muted-foreground">
                {tenant.dominio}
              </SheetDescription>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <TenantStatusBadge estado={tenant.estado} />
                <Badge variant="outline" className="text-xs">
                  {tenant.planNombre}
                </Badge>
                <span className="text-caption text-muted-foreground">
                  Desde {new Date(tenant.creadoEn).toLocaleDateString('es-MX')}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {confirmandoSuspension ? (
            <div className="p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                  <h3 className="font-semibold text-red-700 text-body2">
                    ¿Suspender a &quot;{tenant.nombre}&quot;?
                  </h3>
                </div>
                <p className="text-body2 text-red-600 mb-5">
                  Esta acción bloqueará el acceso de todos sus usuarios al sistema de forma
                  inmediata.
                </p>
                <label className="block text-body2 font-medium text-foreground mb-2">
                  Escribe &quot;SUSPENDER&quot; para confirmar:
                </label>
                <input
                  type="text"
                  value={textoConfirmacion}
                  onChange={(e) => setTextoConfirmacion(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="SUSPENDER"
                />
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setConfirmandoSuspension(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={textoConfirmacion !== 'SUSPENDER'}
                  onClick={handleSuspend}
                >
                  Confirmar Suspensión
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="resumen" className="flex flex-col h-full">
              <TabsList className="mx-6 mt-4 mb-2 w-auto self-start">
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                <TabsTrigger value="facturas">Facturas</TabsTrigger>
                <TabsTrigger value="actividad">Actividad</TabsTrigger>
              </TabsList>

              <TabsContent value="resumen" className="px-6 pb-6 space-y-5">
                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="bg-muted/40 rounded-xl p-3 text-center">
                    <div className="flex justify-center mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-h6 font-bold text-foreground">{tenant.totalUsuarios}</p>
                    <p className="text-caption text-muted-foreground">Usuarios activos</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3 text-center">
                    <div className="flex justify-center mb-1">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-h6 font-bold text-foreground">${tenant.mrr}</p>
                    <p className="text-caption text-muted-foreground">MRR</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3 text-center">
                    <div className="flex justify-center mb-1">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-h6 font-bold text-foreground">{dias}</p>
                    <p className="text-caption text-muted-foreground">Días activo</p>
                  </div>
                </div>

                {/* Recursos */}
                <div className="space-y-4">
                  <h3 className="text-body2 font-semibold text-foreground">Uso de recursos</h3>

                  <div>
                    <div className="flex justify-between text-caption text-muted-foreground mb-1">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Usuarios
                      </span>
                      <span>
                        {tenant.totalUsuarios} / {tenant.limiteUsuarios} ({userPct}%)
                      </span>
                    </div>
                    <Progress value={userPct} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-caption text-muted-foreground mb-1">
                      <span className="flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5" /> Almacenamiento
                      </span>
                      <span>
                        {tenant.almacenamientoUsadoGB} / {tenant.limiteAlmacenamientoGB} GB (
                        {storagePct}%)
                      </span>
                    </div>
                    <Progress value={storagePct} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-caption text-muted-foreground mb-1">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" /> API calls/mes
                      </span>
                      <span>60k / 100k ({apiPct}%)</span>
                    </div>
                    <Progress value={apiPct} className="h-2" />
                  </div>
                </div>

                {/* Suspend button */}
                {tenant.estado !== 'SUSPENDIDO' && (
                  <div className="pt-4 border-t border-border/40">
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      onClick={() => setConfirmandoSuspension(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Suspender Tenant
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="usuarios" className="px-6 pb-6">
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left py-2 text-caption font-semibold text-muted-foreground">
                          Usuario
                        </th>
                        <th className="text-left py-2 text-caption font-semibold text-muted-foreground">
                          Rol
                        </th>
                        <th className="text-left py-2 text-caption font-semibold text-muted-foreground">
                          Último acceso
                        </th>
                        <th className="text-left py-2 text-caption font-semibold text-muted-foreground">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_USERS.map((u) => (
                        <tr key={u.email} className="border-b border-border/20">
                          <td className="py-2.5">
                            <p className="font-medium text-foreground text-body2">{u.nombre}</p>
                            <p className="text-caption text-muted-foreground">{u.email}</p>
                          </td>
                          <td className="py-2.5 text-body2 text-muted-foreground">{u.rol}</td>
                          <td className="py-2.5 text-body2 text-muted-foreground">
                            {u.ultimoAcceso}
                          </td>
                          <td className="py-2.5">
                            <Badge
                              variant="soft"
                              className={
                                u.estado === 'Activo'
                                  ? 'bg-emerald-100 text-emerald-700 border-transparent'
                                  : 'bg-gray-100 text-gray-500 border-transparent'
                              }
                            >
                              {u.estado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="facturas" className="px-6 pb-6">
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left py-2 text-caption font-semibold text-muted-foreground">
                          Periodo
                        </th>
                        <th className="text-left py-2 text-caption font-semibold text-muted-foreground">
                          Monto
                        </th>
                        <th className="text-left py-2 text-caption font-semibold text-muted-foreground">
                          Estado
                        </th>
                        <th className="text-left py-2 text-caption font-semibold text-muted-foreground">
                          Vencimiento
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_FACTURAS_TENANT.map((f, i) => (
                        <tr key={i} className="border-b border-border/20">
                          <td className="py-2.5 text-body2 text-foreground">{f.periodo}</td>
                          <td className="py-2.5 font-semibold text-foreground">{f.monto}</td>
                          <td className="py-2.5">
                            <Badge variant="soft" className={estadoBadgeColor[f.estado] || ''}>
                              {f.estado}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-body2 text-muted-foreground">
                            {f.vencimiento}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="actividad" className="px-6 pb-6">
                <div className="space-y-3 mt-2">
                  {MOCK_ACTIVIDAD.map((ev, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <div>
                        <p className="text-body2 text-foreground">{ev.evento}</p>
                        <p className="text-caption text-muted-foreground font-mono">
                          {ev.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="border-t border-border/40 px-6 py-4">
          <Button variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import React, { useState } from 'react';
import { Link2, Unlink, Globe, Phone, MapPin, Building2, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { Sheet, SheetContent } from 'src/shared/components/ui/sheet';
import { EntityTypeBadge } from './entity-type-badge';
import { ContactStatusBadge } from './contact-status-badge';
import { InteractionsTimeline } from '../../productivity/components/InteractionsTimeline';
import { ActivitiesTab } from '../../productivity/components/ActivitiesTab';
import { VaultTab } from '../../productivity/components/VaultTab';
import type { Contacto } from '../types/contacts.types';

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {
  B2B: 'bg-blue-100 text-blue-700',
  B2C: 'bg-emerald-100 text-emerald-700',
  B2G: 'bg-amber-100 text-amber-700',
};

interface ContactDetailDrawerProps {
  contacto: Contacto | null;
  todos: Contacto[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (c: Contacto) => void;
  onAddRelacion: (aId: string, bId: string, cargo?: string) => Promise<void>;
  onRemoveRelacion: (aId: string, bId: string) => Promise<void>;
}

export const ContactDetailDrawer: React.FC<ContactDetailDrawerProps> = ({
  contacto,
  todos,
  isOpen,
  onClose,
  onEdit,
  onAddRelacion,
  onRemoveRelacion,
}) => {
  const [tab, setTab] = useState<'info' | 'historial' | 'actividades' | 'archivos' | 'relaciones'>(
    'info'
  );
  const [selectedRelId, setSelectedRelId] = useState('');
  const [linkingCargo, setLinkingCargo] = useState('');

  const relacionIds = contacto?.relaciones.map((r) => r.entidadId) ?? [];
  const disponibles = todos.filter((c) => c.id !== contacto?.id && !relacionIds.includes(c.id));

  const handleAddRelacion = async () => {
    if (!selectedRelId || !contacto) return;
    await onAddRelacion(contacto.id, selectedRelId, linkingCargo || undefined);
    setSelectedRelId('');
    setLinkingCargo('');
  };

  return (
    <Sheet open={isOpen && !!contacto} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="sm:max-w-[520px] flex flex-col p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b shrink-0 bg-gray-50">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback
                className={`text-lg font-bold ${AVATAR_COLORS[contacto?.tipo ?? 'B2B']}`}
              >
                {contacto ? getInitials(contacto.nombre) : ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">
                {contacto?.nombre}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {contacto && <EntityTypeBadge tipo={contacto.tipo} />}
                {contacto && <ContactStatusBadge estado={contacto.estado} />}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => contacto && onEdit(contacto)}
              className="h-8 text-xs"
            >
              Editar
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0 overflow-x-auto no-scrollbar bg-gray-50/50">
          {(['info', 'historial', 'actividades', 'archivos', 'relaciones'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-[13px] font-medium transition-colors capitalize whitespace-nowrap ${
                tab === t
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
            >
              {t === 'info' && 'General'}
              {t === 'historial' && 'Historial'}
              {t === 'actividades' && 'Agenda'}
              {t === 'archivos' && 'Bóveda'}
              {t === 'relaciones' && `Relaciones (${contacto?.relaciones.length ?? 0})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Tab: Info */}
          {tab === 'info' && contacto && (
            <div className="space-y-4">
              <InfoRow icon={<UserCheck size={15} />} label="Email" value={contacto.email} />
              {contacto.telefono && (
                <InfoRow icon={<Phone size={15} />} label="Teléfono" value={contacto.telefono} />
              )}
              <InfoRow
                icon={<MapPin size={15} />}
                label="Ubicación"
                value={`${contacto.ciudad ?? ''}${contacto.ciudad ? ', ' : ''}${contacto.pais}`}
              />

              {contacto.tipo === 'B2B' && (
                <>
                  {contacto.nit && (
                    <InfoRow
                      icon={<Building2 size={15} />}
                      label="NIT / RUT"
                      value={contacto.nit}
                    />
                  )}
                  {contacto.sector && (
                    <InfoRow
                      icon={<Building2 size={15} />}
                      label="Sector"
                      value={contacto.sector}
                    />
                  )}
                  {contacto.tamano && (
                    <InfoRow
                      icon={<Building2 size={15} />}
                      label="Tamaño"
                      value={
                        {
                          MICRO: 'Micro',
                          PEQUENA: 'Pequeña',
                          MEDIANA: 'Mediana',
                          GRANDE: 'Grande',
                        }[contacto.tamano]
                      }
                    />
                  )}
                  {contacto.sitioWeb && (
                    <InfoRow
                      icon={<Globe size={15} />}
                      label="Sitio web"
                      value={
                        <a
                          href={contacto.sitioWeb}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {contacto.sitioWeb}
                        </a>
                      }
                    />
                  )}
                </>
              )}

              {contacto.tipo === 'B2C' && (
                <>
                  {contacto.cedula && (
                    <InfoRow
                      icon={<UserCheck size={15} />}
                      label="Cédula / ID"
                      value={contacto.cedula}
                    />
                  )}
                  {contacto.cargo && (
                    <InfoRow icon={<Building2 size={15} />} label="Cargo" value={contacto.cargo} />
                  )}
                  {contacto.empresaNombre && (
                    <InfoRow
                      icon={<Building2 size={15} />}
                      label="Empresa"
                      value={contacto.empresaNombre}
                    />
                  )}
                </>
              )}

              {contacto.tipo === 'B2G' && (
                <>
                  {contacto.tipoInstitucion && (
                    <InfoRow
                      icon={<Building2 size={15} />}
                      label="Tipo"
                      value={contacto.tipoInstitucion}
                    />
                  )}
                  <InfoRow
                    icon={<Building2 size={15} />}
                    label="Sector público"
                    value={contacto.entidadPublica ? 'Sí' : 'No'}
                  />
                  {contacto.codigoLicitacion && (
                    <InfoRow
                      icon={<Building2 size={15} />}
                      label="Licitación"
                      value={contacto.codigoLicitacion}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'historial' && contacto && (
            <div className="-mx-6 -my-5 h-[calc(100%+40px)]">
              <InteractionsTimeline contactoId={contacto.id} />
            </div>
          )}

          {tab === 'actividades' && contacto && (
            <div className="-mx-6 -my-5 h-[calc(100%+40px)]">
              <ActivitiesTab contactoId={contacto.id} contactoNombre={contacto.nombre} />
            </div>
          )}

          {tab === 'archivos' && contacto && (
            <div className="-mx-6 -my-5 h-[calc(100%+40px)]">
              <VaultTab contactoId={contacto.id} />
            </div>
          )}

          {/* Tab: Relaciones */}
          {tab === 'relaciones' && contacto && (
            <div className="space-y-4">
              {contacto.relaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm text-center">
                  <Link2 className="h-8 w-8 mb-3 opacity-40" />
                  <p>Sin relaciones vinculadas todavía.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacto.relaciones.map((rel) => (
                    <div
                      key={rel.entidadId}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={`text-xs ${AVATAR_COLORS[rel.entidadTipo]}`}>
                            {getInitials(rel.entidadNombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{rel.entidadNombre}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {rel.entidadTipo}
                            </Badge>
                            {rel.cargo && (
                              <span className="text-xs text-muted-foreground">{rel.cargo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveRelacion(contacto.id, rel.entidadId)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Desvincular"
                      >
                        <Unlink size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Vincular nueva relación */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vincular entidad
                </h4>
                <select
                  value={selectedRelId}
                  onChange={(e) => setSelectedRelId(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm bg-white"
                >
                  <option value="">Buscar contacto o empresa...</option>
                  {disponibles.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} ({d.tipo})
                    </option>
                  ))}
                </select>
                <input
                  value={linkingCargo}
                  onChange={(e) => setLinkingCargo(e.target.value)}
                  placeholder="Cargo / rol en la relación (opcional)"
                  className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddRelacion}
                  disabled={!selectedRelId}
                  className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700"
                >
                  <Link2 size={14} /> Vincular
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

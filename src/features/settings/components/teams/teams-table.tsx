'use client';

import { Icon } from 'src/shared/components/ui/icon';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import type { Equipo } from '../../types/settings.types';
import { SectionCard } from 'src/shared/components/layouts/page';

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const ACCENT_COLORS = [
  { strip: 'bg-blue-500', avatar: 'bg-blue-100 text-blue-700', badge: 'bg-blue-50 text-blue-700' },
  {
    strip: 'bg-emerald-500',
    avatar: 'bg-emerald-100 text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  {
    strip: 'bg-violet-500',
    avatar: 'bg-violet-100 text-violet-700',
    badge: 'bg-violet-50 text-violet-700',
  },
  {
    strip: 'bg-amber-500',
    avatar: 'bg-amber-100 text-amber-700',
    badge: 'bg-amber-50 text-amber-700',
  },
  { strip: 'bg-rose-500', avatar: 'bg-rose-100 text-rose-700', badge: 'bg-rose-50 text-rose-700' },
];

interface TeamsGridProps {
  equipos: Equipo[];
  onEdit: (equipo: Equipo) => void;
  onDelete: (equipo: Equipo) => void;
}

export function TeamsTable({ equipos, onEdit, onDelete }: TeamsGridProps) {
  if (equipos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Icon name="Users" size={40} className="mb-3 opacity-40" />
        <p className="text-body2">No hay equipos configurados.</p>
        <p className="text-caption mt-1">
          Crea tu primer equipo para organizar a tu fuerza de ventas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
      {equipos.map((equipo, idx) => {
        const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
        const preview = equipo.miembros.slice(0, 6);
        const extra = equipo.miembros.length - preview.length;

        return (
          <SectionCard
            key={equipo.id}
            noPadding
            className="group relative flex flex-col overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Color strip */}
            <div className={`h-1.5 w-full ${accent.strip}`} />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarFallback className={`text-sm font-bold ${accent.avatar}`}>
                    {getInitials(equipo.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{equipo.nombre}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Icon name="Crown" size={11} className="text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">{equipo.liderNombre}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(equipo)}
                >
                  <Icon name="Pencil" size={14} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Icon name="MoreHorizontal" size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(equipo)}>
                      Editar equipo
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(equipo)}
                      disabled={equipo.totalMiembros > 0}
                    >
                      Eliminar equipo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Members section */}
            <div className="flex flex-col gap-2 px-5 pb-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Miembros
                </span>
                <Badge variant="soft" color="default" className="text-xs">
                  {equipo.totalMiembros}
                </Badge>
              </div>

              {preview.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2.5">
                    {preview.map((m) => (
                      <Avatar key={m.usuarioId} className="h-8 w-8 ring-2 ring-background">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground font-medium">
                          {getInitials(m.usuarioNombre)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {extra > 0 && (
                    <span className="text-xs text-muted-foreground font-medium">+{extra} más</span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Sin miembros asignados</p>
              )}
            </div>

            {/* Footer */}
            <button
              onClick={() => onEdit(equipo)}
              className="border-t border-border/30 px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors text-left w-full"
            >
              Gestionar miembros →
            </button>
          </SectionCard>
        );
      })}
    </div>
  );
}

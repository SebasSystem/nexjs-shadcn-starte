'use client';

import { useState } from 'react';
import { Eye, Pencil, MoreHorizontal, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { EntityTypeBadge } from './entity-type-badge';
import { ContactStatusBadge } from './contact-status-badge';
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

function getSubtitle(c: Contacto): string {
  if (c.tipo === 'B2B') return c.nit ?? '';
  if (c.tipo === 'B2C') return c.empresaNombre ?? c.cargo ?? '';
  return c.tipoInstitucion ?? '';
}

interface ContactsTableProps {
  contactos: Contacto[];
  onEdit: (c: Contacto) => void;
  onViewDetail: (c: Contacto) => void;
  onDelete: (c: Contacto) => void;
}

export function ContactsTable({ contactos, onEdit, onViewDetail, onDelete }: ContactsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (contactos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Users className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron contactos con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[28%]">
              Nombre
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[14%]">
              Tipo
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[20%]">
              Email
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
              País
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[8%]">
              Relaciones
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[8%]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {contactos.map((c) => (
            <tr
              key={c.id}
              className="border-b border-border/20 hover:bg-muted/40 cursor-pointer transition-colors"
              onClick={() => onViewDetail(c)}
              onMouseEnter={() => setHoveredRow(c.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={`text-xs font-semibold ${AVATAR_COLORS[c.tipo]}`}>
                      {getInitials(c.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-body2 leading-tight">
                      {c.nombre}
                    </p>
                    <p className="text-caption text-muted-foreground">{getSubtitle(c)}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <EntityTypeBadge tipo={c.tipo} />
              </td>
              <td className="py-3 px-4">
                <span className="text-body2 text-muted-foreground truncate block max-w-[180px]">
                  {c.email}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-body2">{c.pais}</span>
              </td>
              <td className="py-3 px-4">
                <ContactStatusBadge estado={c.estado} />
              </td>
              <td className="py-3 px-4">
                <span className="text-body2 font-medium text-foreground">
                  {c.relaciones.length}
                </span>
              </td>
              <td className="py-3 px-4">
                <div
                  className={`flex items-center gap-1 transition-opacity ${hoveredRow === c.id ? 'opacity-100' : 'opacity-0'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onViewDetail(c)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetail(c)}>
                        Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(c)}>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(c)}>
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

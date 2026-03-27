'use client';

import { useState } from 'react';
import { Pencil, MoreHorizontal, Sliders } from 'lucide-react';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import type { CampoPersonalizado, TipoCampo, ModuloCampo } from '../../types/settings.types';

const TIPO_LABELS: Record<TipoCampo, string> = {
  texto: 'Texto',
  numero: 'Número',
  fecha: 'Fecha',
  select: 'Lista de opciones',
  booleano: 'Sí / No',
};

const MODULO_LABELS: Record<ModuloCampo, string> = {
  contactos: 'Contactos',
  empresas: 'Empresas',
  oportunidades: 'Oportunidades',
  productos: 'Productos',
};

interface CustomFieldsTableProps {
  campos: CampoPersonalizado[];
  onEdit: (campo: CampoPersonalizado) => void;
  onDelete: (campo: CampoPersonalizado) => void;
}

export function CustomFieldsTable({ campos, onEdit, onDelete }: CustomFieldsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (campos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Sliders className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No hay campos personalizados configurados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[24%]">
              Etiqueta
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[20%]">
              Nombre técnico
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[16%]">
              Tipo
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[16%]">
              Módulo
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
              Requerido
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {campos.map((campo) => (
            <tr
              key={campo.id}
              className="border-b border-border/20 hover:bg-muted/40 transition-colors"
              onMouseEnter={() => setHoveredRow(campo.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="py-3 px-4">
                <p className="font-medium text-foreground text-body2">{campo.etiqueta}</p>
                {campo.tipo === 'select' && campo.opciones && (
                  <p className="text-caption text-muted-foreground mt-0.5">
                    {campo.opciones.slice(0, 3).join(', ')}
                    {campo.opciones.length > 3 ? '...' : ''}
                  </p>
                )}
              </td>
              <td className="py-3 px-4">
                <code className="text-xs bg-muted/60 px-1.5 py-0.5 rounded font-mono">
                  {campo.nombre}
                </code>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="text-xs">
                  {TIPO_LABELS[campo.tipo]}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant="soft" color="default" className="text-xs">
                  {MODULO_LABELS[campo.modulo]}
                </Badge>
              </td>
              <td className="py-3 px-4">
                {campo.requerido ? (
                  <Badge variant="soft" color="error" className="text-xs">
                    Sí
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-body2">No</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div
                  className={`flex items-center gap-1 transition-opacity ${hoveredRow === campo.id ? 'opacity-100' : 'opacity-0'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(campo)}
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
                      <DropdownMenuItem onClick={() => onEdit(campo)}>
                        Editar campo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(campo)}>
                        Eliminar campo
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

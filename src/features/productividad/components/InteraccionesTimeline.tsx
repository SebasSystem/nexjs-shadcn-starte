'use client';

import React, { useState } from 'react';
import { useInteracciones } from '../hooks/use-interacciones';
import { Button } from 'src/shared/components/ui/button';
import { Textarea } from 'src/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';
import { PhoneCall, Mail, StickyNote, Activity } from 'lucide-react';
import type { TipoInteraccion } from '../types/productividad.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ICONS = {
  NOTA: <StickyNote size={16} className="text-amber-500" />,
  LLAMADA: <PhoneCall size={16} className="text-green-500" />,
  CORREO: <Mail size={16} className="text-blue-500" />,
  SISTEMA: <Activity size={16} className="text-gray-400" />,
};

export const InteraccionesTimeline = ({ contactoId }: { contactoId: string }) => {
  const { data, isLoading, isSubmitting, addInteraccion } = useInteracciones(contactoId);
  const [tipo, setTipo] = useState<TipoInteraccion>('NOTA');
  const [contenido, setContenido] = useState('');

  const handleAdd = async () => {
    if (!contenido.trim()) return;
    const success = await addInteraccion(tipo, contenido);
    if (success) {
      setContenido('');
      setTipo('NOTA');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h4 className="text-sm font-semibold mb-3">Registrar interacción</h4>
        <div className="flex gap-2 mb-2">
          <Select value={tipo} onValueChange={(v: TipoInteraccion) => setTipo(v)}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOTA">Nota</SelectItem>
              <SelectItem value="LLAMADA">Llamada</SelectItem>
              <SelectItem value="CORREO">Correo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea
          placeholder="Escribe los detalles aquí..."
          className="text-sm min-h-[80px] bg-white resize-none"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={isSubmitting || !contenido.trim()}
            className="text-xs h-8"
          >
            Registrar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="text-center text-sm text-gray-500">Cargando historial...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-sm text-gray-400 mt-10">
            No hay interacciones registradas.
          </div>
        ) : (
          <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-6">
            {data.map((item) => (
              <div key={item.id} className="relative pl-6">
                <div className="absolute -left-[13px] top-1 h-6 w-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  {ICONS[item.tipo]}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                      {item.tipo}
                    </span>
                    <span className="text-[11px] text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(item.fecha), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 bg-white border border-gray-100 p-3 rounded-lg shadow-sm whitespace-pre-wrap">
                    {item.contenido}
                  </div>
                  <div className="mt-1.5 text-[11px] text-gray-400">
                    Registrado por: {item.autor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

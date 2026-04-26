'use client';

import React, { useState } from 'react';
import { useInteractions } from '../hooks/use-interactions';
import { Button } from 'src/shared/components/ui/button';
import { Textarea } from 'src/shared/components/ui/textarea';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Icon } from 'src/shared/components/ui/icon';
import type { TipoInteraccion } from '../types/productivity.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ICONS = {
  NOTA: <Icon name="StickyNote" size={16} className="text-amber-500" />,
  LLAMADA: <Icon name="PhoneCall" size={16} className="text-green-500" />,
  CORREO: <Icon name="Mail" size={16} className="text-blue-500" />,
  SISTEMA: <Icon name="Activity" size={16} className="text-gray-400" />,
};

export const InteractionsTimeline = ({ contactoId }: { contactoId: string }) => {
  const { data, isLoading, isSubmitting, addInteraccion } = useInteractions(contactoId);
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
          <SelectField
            options={[
              { value: 'NOTA', label: 'Nota' },
              { value: 'LLAMADA', label: 'Llamada' },
              { value: 'CORREO', label: 'Correo' },
            ]}
            value={tipo}
            onChange={(v) => setTipo(v as TipoInteraccion)}
            className="w-[140px]"
          />
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

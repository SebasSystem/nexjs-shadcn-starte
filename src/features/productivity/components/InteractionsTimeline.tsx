'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useState } from 'react';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Textarea } from 'src/shared/components/ui/textarea';

import { useInteractions } from '../hooks/use-interactions';
import type { InteractionType } from '../types/productivity.types';

const FALLBACK_ICON = <Icon name="Circle" size={16} className="text-muted-foreground" />;

const ICONS: Record<string, React.ReactNode> = {
  NOTE: <Icon name="StickyNote" size={16} className="text-amber-500" />,
  CALL: <Icon name="PhoneCall" size={16} className="text-green-500" />,
  EMAIL: <Icon name="Mail" size={16} className="text-blue-500" />,
  SYSTEM: <Icon name="Activity" size={16} className="text-muted-foreground" />,
};

export const InteractionsTimeline = ({ contactoId }: { contactoId: string }) => {
  const { data, isLoading, addInteraction } = useInteractions(contactoId);
  const [type, setType] = useState<InteractionType>('NOTE');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    const success = await addInteraction(type, content);
    setIsSubmitting(false);
    if (success) {
      setContent('');
      setType('NOTE');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border/40 bg-muted/20">
        <h4 className="text-sm font-semibold mb-3">Registrar interacción</h4>
        <div className="flex gap-2 mb-2">
          <SelectField
            options={[
              { value: 'NOTE', label: 'Nota' },
              { value: 'CALL', label: 'Llamada' },
              { value: 'EMAIL', label: 'Correo' },
            ]}
            value={type}
            onChange={(v) => setType(v as InteractionType)}
            className="w-[140px]"
          />
        </div>
        <Textarea
          placeholder="Escribe los detalles aquí..."
          className="text-sm min-h-[80px] resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={isSubmitting || !content.trim()}
            className="text-xs h-8"
          >
            Registrar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">Cargando historial...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-10">
            No hay interacciones registradas.
          </div>
        ) : (
          <div className="relative border-l border-border ml-3 space-y-6 pb-6">
            {data.map((item) => (
              <div key={item.uid} className="relative pl-6">
                <div className="absolute -left-[13px] top-1 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                  {ICONS[item.type] ?? FALLBACK_ICON}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                      {item.type === 'NOTE'
                        ? 'Nota'
                        : item.type === 'CALL'
                          ? 'Llamada'
                          : item.type === 'EMAIL'
                            ? 'Correo'
                            : 'Sistema'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-foreground bg-muted/30 border border-border/40 p-3 rounded-lg whitespace-pre-wrap">
                    {item.content}
                  </div>
                  <div className="mt-1.5 text-[11px] text-muted-foreground">
                    Registrado por: {item.author}
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

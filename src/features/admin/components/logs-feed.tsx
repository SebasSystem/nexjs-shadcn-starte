'use client';

import { useMemo, useState } from 'react';
import { LogEntry } from 'src/features/admin/types/admin.types';
import { formatDate, formatTime } from 'src/lib/date';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';

interface LogsFeedProps {
  logs: LogEntry[];
}

const nivelConfig = {
  ERROR: {
    rowClass: 'bg-red-50',
    badgeClass: 'text-red-600 font-bold',
  },
  WARN: {
    rowClass: 'bg-amber-50',
    badgeClass: 'text-amber-600 font-bold',
  },
  INFO: {
    rowClass: 'bg-white',
    badgeClass: 'text-gray-500',
  },
};

export function LogsFeed({ logs }: LogsFeedProps) {
  const [filtroNivel, setFiltroNivel] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [busqueda, setBusqueda] = useState('');

  const counts = useMemo(() => {
    return {
      ERROR: logs.filter((l) => l.level === 'ERROR').length,
      WARN: logs.filter((l) => l.level === 'WARN').length,
      INFO: logs.filter((l) => l.level === 'INFO').length,
    };
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filtroNivel !== 'ALL' && l.level !== filtroNivel) return false;
      if (
        busqueda &&
        !l.message.toLowerCase().includes(busqueda.toLowerCase()) &&
        !l.tenant_nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
        return false;
      return true;
    });
  }, [logs, filtroNivel, busqueda]);

  const formatTimestamp = (ts: string) => `${formatDate(ts)} ${formatTime(ts)}`;

  return (
    <div>
      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
          {(['ALL', 'ERROR', 'WARN', 'INFO'] as const).map((nivel) => (
            <button
              key={nivel}
              onClick={() => setFiltroNivel(nivel)}
              className={`px-3 py-1 rounded-md text-caption font-medium transition-colors ${
                filtroNivel === nivel
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {nivel}
              {nivel !== 'ALL' && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    nivel === 'ERROR'
                      ? 'bg-red-100 text-red-600'
                      : nivel === 'WARN'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {counts[nivel]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en mensajes..."
            leftIcon={<Icon name="Search" size={14} />}
          />
        </div>
      </div>

      {/* Feed */}
      <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/20">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-body2">
            No se encontraron logs con los filtros aplicados.
          </div>
        ) : (
          filtered.map((log) => {
            const config = nivelConfig[log.level];
            return (
              <div
                key={log.uid}
                className={`flex items-start gap-4 px-4 py-2.5 font-mono text-xs ${config.rowClass}`}
              >
                <span className="text-muted-foreground shrink-0 w-[70px]">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span className={`shrink-0 w-[46px] ${config.badgeClass}`}>{log.level}</span>
                <span className="text-blue-600 shrink-0 w-[130px] truncate">
                  {log.tenant_nombre}
                </span>
                <span className="text-foreground/80 flex-1 break-all">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'use client';

const TABS = ['info', 'historial', 'actividades', 'archivos', 'relaciones'] as const;
export type DetailTab = (typeof TABS)[number];

interface ContactDetailTabsProps {
  selected: DetailTab;
  onChange: (tab: DetailTab) => void;
  relationshipsCount: number;
}

export function ContactDetailTabs({
  selected,
  onChange,
  relationshipsCount,
}: ContactDetailTabsProps) {
  return (
    <div className="flex border-b shrink-0 overflow-x-auto no-scrollbar bg-muted/20">
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-3 text-[13px] font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
            selected === t
              ? 'border-b-2 border-blue-600 text-blue-600 bg-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          {t === 'info' && 'General'}
          {t === 'historial' && 'Historial'}
          {t === 'actividades' && 'Agenda'}
          {t === 'archivos' && 'Bóveda'}
          {t === 'relaciones' && `Relaciones (${relationshipsCount})`}
        </button>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { cn } from 'src/lib/utils';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';

import type { Opportunity } from '../types/sales.types';

// ─── Local item type (checklist was removed from Opportunity type) ─────────────
interface ChecklistEntry {
  id: string;
  text: string;
  done: boolean;
}

interface OpportunityChecklistProps {
  opportunity: Opportunity;
}

export function OpportunityChecklist({ opportunity: _opportunity }: OpportunityChecklistProps) {
  // Local-only state — backend persistence via interactions API coming soon
  const [items, setItems] = useState<ChecklistEntry[]>([]);
  const [newText, setNewText] = useState('');

  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggleItem = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const addItem = () => {
    const text = newText.trim();
    if (!text) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), text, done: false }]);
    setNewText('');
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      {/* Coming soon banner */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-2">
        <Icon name="AlertTriangle" size={13} className="text-amber-500 shrink-0" />
        <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-snug">
          Las tareas se guardan solo en esta sesión. La persistencia backend estará disponible
          próximamente.
        </p>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-caption text-muted-foreground">
              {done} de {total} completadas
            </span>
            <span className="text-caption font-bold text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progress === 100 ? 'bg-success' : progress >= 50 ? 'bg-primary' : 'bg-warning'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-1">
        {items.length === 0 ? (
          <p className="text-caption text-muted-foreground text-center py-4">
            No hay tareas. Agregá la primera.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 group rounded-lg px-2 py-1.5 hover:bg-muted/30 transition-colors"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all',
                  item.done
                    ? 'bg-success border-success text-white'
                    : 'border-border hover:border-success/60'
                )}
              >
                {item.done && <Icon name="Check" size={10} strokeWidth={3} />}
              </button>
              <span
                className={cn(
                  'flex-1 text-body2 transition-colors',
                  item.done ? 'line-through text-muted-foreground' : 'text-foreground'
                )}
              >
                {item.text}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-0.5"
              >
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add item */}
      <div className="flex gap-2 pt-2 border-t border-border/40">
        <Input
          placeholder="Nueva tarea..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 h-8 text-sm"
        />
        <Button size="sm" variant="outline" onClick={addItem} disabled={!newText.trim()}>
          <Icon name="Plus" size={14} />
        </Button>
      </div>
    </div>
  );
}

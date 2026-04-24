'use client';

import { useState } from 'react';
import { Icon } from 'src/shared/components/ui/icon';
import { cn } from 'src/lib/utils';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { useSalesContext } from '../context/SalesContext';
import type { Opportunity } from '../types/sales.types';

interface OpportunityChecklistProps {
  opportunity: Opportunity;
}

export function OpportunityChecklist({ opportunity }: OpportunityChecklistProps) {
  const { toggleChecklistItem, addChecklistItem, removeChecklistItem } = useSalesContext();
  const [newText, setNewText] = useState('');

  const done = opportunity.checklist.filter((i) => i.done).length;
  const total = opportunity.checklist.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return;
    addChecklistItem(opportunity.id, text);
    setNewText('');
  };

  return (
    <div className="space-y-4">
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
        {opportunity.checklist.length === 0 ? (
          <p className="text-caption text-muted-foreground text-center py-4">
            No hay tareas. Agregá la primera.
          </p>
        ) : (
          opportunity.checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 group rounded-lg px-2 py-1.5 hover:bg-muted/30 transition-colors"
            >
              <button
                onClick={() => toggleChecklistItem(opportunity.id, item.id)}
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
                onClick={() => removeChecklistItem(opportunity.id, item.id)}
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
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 h-8 text-sm"
        />
        <Button size="sm" variant="outline" onClick={handleAdd} disabled={!newText.trim()}>
          <Icon name="Plus" size={14} />
        </Button>
      </div>
    </div>
  );
}

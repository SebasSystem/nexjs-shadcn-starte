'use client';

import { useState } from 'react';
import { MOCK_AUTOMATION_USERS } from 'src/_mock/_automation';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';

import { AssignmentRuleDrawer } from '../components/AssignmentRuleDrawer';
import { RuleStatusBadge } from '../components/RuleStatusBadge';
import { useAutomation } from '../hooks/useAutomation';
import type { AssignmentRule } from '../types';
import { ASSIGNMENT_RULE_TYPE_LABELS } from '../types';

function getUserNames(userIds: string[]): string {
  if (userIds.length === 0) return '—';
  return userIds.map((id) => MOCK_AUTOMATION_USERS.find((u) => u.id === id)?.name ?? id).join(', ');
}

export function AssignmentRulesView() {
  const { assignmentRules, createAssignmentRule, updateAssignmentRule, deleteAssignmentRule } =
    useAutomation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AssignmentRule | null>(null);

  const handleEdit = (rule: AssignmentRule) => {
    setEditingRule(rule);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setEditingRule(null);
  };

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title="Reglas de Asignación"
        subtitle="Configurá cómo se distribuyen automáticamente los leads entre los vendedores"
        action={
          <Button color="primary" onClick={() => setDrawerOpen(true)}>
            <Icon name="Plus" size={16} />
            Nueva regla
          </Button>
        }
      />

      <SectionCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {assignmentRules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    Sin reglas de asignación. Creá una nueva.
                  </td>
                </tr>
              )}
              {assignmentRules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold text-foreground">{rule.name}</p>
                    {rule.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                        {rule.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {ASSIGNMENT_RULE_TYPE_LABELS[rule.type]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon name="Users" size={13} className="shrink-0" />
                      <span>{getUserNames(rule.userIds)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RuleStatusBadge enabled={rule.enabled} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Editar"
                        onClick={() => handleEdit(rule)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Icon name="Pencil" size={14} />
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => deleteAssignmentRule(rule.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AssignmentRuleDrawer
        open={drawerOpen}
        item={editingRule}
        onClose={handleClose}
        onCreate={createAssignmentRule}
        onUpdate={updateAssignmentRule}
      />
    </PageContainer>
  );
}

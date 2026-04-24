'use client';

import { useState, useMemo } from 'react';
import { MOCK_AUTOMATION_RULES, MOCK_ASSIGNMENT_RULES } from 'src/_mock/_automation';
import type { AutomationRule, AssignmentRule } from '../types';

export function useAutomation() {
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_AUTOMATION_RULES);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>(MOCK_ASSIGNMENT_RULES);

  const stats = useMemo(
    () => ({
      activeCount: rules.filter((r) => r.enabled).length,
      inactiveCount: rules.filter((r) => !r.enabled).length,
      totalRuns: rules.reduce((sum, r) => sum + r.runCount, 0),
      lastRun: rules
        .filter((r) => r.lastRunAt)
        .sort((a, b) => new Date(b.lastRunAt!).getTime() - new Date(a.lastRunAt!).getTime())[0]
        ?.lastRunAt,
    }),
    [rules]
  );

  const createRule = (
    rule: Omit<AutomationRule, 'id' | 'createdAt' | 'runCount' | 'lastRunAt'>
  ) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      runCount: 0,
    };
    setRules((prev) => [newRule, ...prev]);
    return newRule;
  };

  const updateRule = (id: string, updates: Partial<AutomationRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const createAssignmentRule = (
    rule: Omit<AssignmentRule, 'id' | 'createdAt' | 'roundRobinIndex'>
  ) => {
    const newRule: AssignmentRule = {
      ...rule,
      id: `ar-${Date.now()}`,
      createdAt: new Date().toISOString(),
      roundRobinIndex: 0,
    };
    setAssignmentRules((prev) => [newRule, ...prev]);
    return newRule;
  };

  const updateAssignmentRule = (id: string, updates: Partial<AssignmentRule>) => {
    setAssignmentRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteAssignmentRule = (id: string) => {
    setAssignmentRules((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    rules,
    assignmentRules,
    stats,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    createAssignmentRule,
    updateAssignmentRule,
    deleteAssignmentRule,
  };
}

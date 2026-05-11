'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { paths } from 'src/routes/paths';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';

import { ActionBlock } from '../components/ActionBlock';
import { ConditionBlock } from '../components/ConditionBlock';
import { TriggerBlock } from '../components/TriggerBlock';
import { useAssignmentRules } from '../hooks/useAssignmentRules';
import { useAutomationRules } from '../hooks/useAutomationRules';
import type { RuleFormData } from '../schemas/rule.schema';
import { ruleSchema } from '../schemas/rule.schema';
import type { TriggerEvent, TriggerSource } from '../types';

interface RuleBuilderViewProps {
  ruleId?: string;
}

export function RuleBuilderView({ ruleId }: RuleBuilderViewProps) {
  const router = useRouter();
  const { rules, createRule, updateRule } = useAutomationRules();
  const { assignmentRules } = useAssignmentRules();
  const defaultGroupId = useId();
  const conditionGroupInitialized = useRef(false);
  const isEditing = !!ruleId;
  const existingRule = ruleId ? rules.find((r) => r.uid === ruleId) : undefined;

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger_source: 'crm',
      trigger_event: 'lead_created',
      trigger_config: {},
      condition_groups: [
        {
          uid: `grp-${defaultGroupId}`,
          logic: 'AND',
          conditions: [],
        },
      ],
      actions: [],
    },
  });

  useEffect(() => {
    if (existingRule && !conditionGroupInitialized.current) {
      form.reset({
        name: existingRule.name,
        description: existingRule.description ?? '',
        trigger_source: existingRule.trigger_source,
        trigger_event: existingRule.trigger_event,
        trigger_config: existingRule.trigger_config ?? {},
        condition_groups:
          existingRule.condition_groups.length > 0
            ? existingRule.condition_groups
            : [{ uid: `grp-${defaultGroupId}`, logic: 'AND', conditions: [] }],
        actions: existingRule.actions,
      });
      conditionGroupInitialized.current = true;
    }
  }, [existingRule, form, defaultGroupId]);

  const triggerSource = useWatch({ control: form.control, name: 'trigger_source' });
  const triggerEvent = useWatch({ control: form.control, name: 'trigger_event' });
  const daysThreshold = useWatch({ control: form.control, name: 'trigger_config.days_threshold' });

  // ── Trigger options from backend ──────────────────────────────────────────
  const { data: triggerEventsData } = useQuery({
    queryKey: ['automation', 'trigger-events'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.automation.triggerEvents);
      return (res.data?.data ?? res.data) as {
        sources?: Record<string, string>;
        events?: Record<string, string>;
        mappings?: Record<string, string[]>;
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const sourceOptions = useMemo(() => {
    if (triggerEventsData?.sources) {
      return Object.entries(triggerEventsData.sources).map(([value, label]) => ({ value, label }));
    }
    return [];
  }, [triggerEventsData]);

  const eventOptions = useMemo(() => {
    const src = (triggerSource as string) || 'crm';
    if (triggerEventsData?.mappings?.[src]) {
      return triggerEventsData.mappings[src].map((key: string) => ({
        value: key,
        label: triggerEventsData.events?.[key] ?? key,
      }));
    }
    return [];
  }, [triggerEventsData, triggerSource]);

  const onSubmit = form.handleSubmit((data) => {
    if (isEditing && ruleId) {
      updateRule(ruleId, {
        name: data.name,
        description: data.description,
        trigger_source: data.trigger_source,
        trigger_event: data.trigger_event,
        trigger_config: data.trigger_config,
        condition_groups: data.condition_groups,
        actions: data.actions,
      });
    } else {
      createRule({
        name: data.name,
        description: data.description,
        trigger_source: data.trigger_source,
        trigger_event: data.trigger_event,
        trigger_config: data.trigger_config,
        condition_groups: data.condition_groups,
        actions: data.actions,
        enabled: true,
      });
    }
    router.push(paths.automation.rules);
  });

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title={isEditing ? 'Editar regla' : 'Nueva regla'}
        subtitle="Configurá el disparador, condiciones y acciones de la automatización"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(paths.automation.rules)}>
              <Icon name="ArrowLeft" size={16} />
              Volver
            </Button>
            <Button color="primary" onClick={onSubmit}>
              <Icon name="Save" size={16} />
              Guardar
            </Button>
          </div>
        }
      />

      <div className="space-y-4 max-w-3xl">
        <SectionCard>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Información general
          </h3>
          <div className="space-y-4">
            <Input
              label="Nombre de la regla"
              required
              placeholder="Ej: LinkedIn → Crear Lead automático"
              error={form.formState.errors.name?.message}
              {...form.register('name')}
            />
            <Textarea
              label="Descripción (opcional)"
              placeholder="¿Para qué sirve esta regla?"
              rows={3}
              {...form.register('description')}
            />
          </div>
        </SectionCard>

        <TriggerBlock
          triggerSource={triggerSource}
          triggerEvent={triggerEvent}
          daysThreshold={daysThreshold}
          sourceOptions={[
            { value: 'crm', label: 'CRM' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'facebook', label: 'Facebook' },
            { value: 'time', label: 'Tiempo' },
          ]}
          eventOptions={[
            { value: 'lead_created', label: 'Lead creado' },
            { value: 'lead_stage_changed', label: 'Lead cambió de etapa' },
            { value: 'deal_won', label: 'Deal ganado' },
            { value: 'deal_lost', label: 'Deal perdido' },
            { value: 'contact_updated', label: 'Contacto actualizado' },
            { value: 'task_completed', label: 'Tarea completada' },
            { value: 'inactivity_days', label: 'Inactividad (días)' },
          ]}
          onSourceChange={(v: TriggerSource) => form.setValue('trigger_source', v)}
          onEventChange={(v: TriggerEvent) => form.setValue('trigger_event', v)}
          onDaysThresholdChange={(v) => form.setValue('trigger_config.days_threshold', v)}
        />

        <ConditionBlock form={form} groupIndex={0} />

        <ActionBlock form={form} assignmentRules={assignmentRules} />
      </div>
    </PageContainer>
  );
}

'use client';

import { useEffect, useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from 'src/shared/components/ui/icon';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { paths } from 'src/routes/paths';
import { ruleSchema } from '../schemas/rule.schema';
import { TriggerBlock } from '../components/TriggerBlock';
import { ConditionBlock } from '../components/ConditionBlock';
import { ActionBlock } from '../components/ActionBlock';
import { useAutomation } from '../hooks/useAutomation';
import type { RuleFormData } from '../schemas/rule.schema';
import type { TriggerSource, TriggerEvent } from '../types';

interface RuleBuilderViewProps {
  ruleId?: string;
}

export function RuleBuilderView({ ruleId }: RuleBuilderViewProps) {
  const router = useRouter();
  const { rules, createRule, updateRule } = useAutomation();
  const defaultGroupId = useId();
  const conditionGroupInitialized = useRef(false);
  const isEditing = !!ruleId;
  const existingRule = ruleId ? rules.find((r) => r.id === ruleId) : undefined;

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: '',
      description: '',
      triggerSource: 'crm',
      triggerEvent: 'lead_created',
      triggerConfig: {},
      conditionGroups: [
        {
          id: `grp-${defaultGroupId}`,
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
        triggerSource: existingRule.triggerSource,
        triggerEvent: existingRule.triggerEvent,
        triggerConfig: existingRule.triggerConfig ?? {},
        conditionGroups:
          existingRule.conditionGroups.length > 0
            ? existingRule.conditionGroups
            : [{ id: `grp-${defaultGroupId}`, logic: 'AND', conditions: [] }],
        actions: existingRule.actions,
      });
      conditionGroupInitialized.current = true;
    }
  }, [existingRule, form, defaultGroupId]);

  const triggerSource = useWatch({ control: form.control, name: 'triggerSource' });
  const triggerEvent = useWatch({ control: form.control, name: 'triggerEvent' });
  const daysThreshold = useWatch({ control: form.control, name: 'triggerConfig.daysThreshold' });

  const onSubmit = form.handleSubmit((data) => {
    if (isEditing && ruleId) {
      updateRule(ruleId, {
        name: data.name,
        description: data.description,
        triggerSource: data.triggerSource,
        triggerEvent: data.triggerEvent,
        triggerConfig: data.triggerConfig,
        conditionGroups: data.conditionGroups,
        actions: data.actions,
      });
    } else {
      createRule({
        name: data.name,
        description: data.description,
        triggerSource: data.triggerSource,
        triggerEvent: data.triggerEvent,
        triggerConfig: data.triggerConfig,
        conditionGroups: data.conditionGroups,
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Descripción (opcional)</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 transition-all min-h-[72px] resize-none"
                placeholder="¿Para qué sirve esta regla?"
                {...form.register('description')}
              />
            </div>
          </div>
        </SectionCard>

        <TriggerBlock
          triggerSource={triggerSource}
          triggerEvent={triggerEvent}
          daysThreshold={daysThreshold}
          onSourceChange={(v: TriggerSource) => form.setValue('triggerSource', v)}
          onEventChange={(v: TriggerEvent) => form.setValue('triggerEvent', v)}
          onDaysThresholdChange={(v) => form.setValue('triggerConfig.daysThreshold', v)}
        />

        <ConditionBlock form={form} groupIndex={0} />

        <ActionBlock form={form} />
      </div>
    </PageContainer>
  );
}

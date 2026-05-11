'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlans } from 'src/features/commissions/hooks/use-plans';
import { useSimulator } from 'src/features/commissions/hooks/use-simulator';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';

export const SimulatorView = () => {
  const [acordeonAbierto, setAcordeonAbierto] = useState(false);
  const { plans } = usePlans();

  const {
    planUid,
    setPlanUid,
    accumulatedSales,
    setAccumulatedSales,
    hypotheticalSale,
    setHypotheticalSale,
    totalCommission,
    effectivePercentage,
    tierApplied,
    currentTier,
    isSimulating,
    simulate,
    resetForm,
  } = useSimulator();

  // Default to first active plan
  useEffect(() => {
    const activePlans = plans.filter((p) => p.is_active);
    if (activePlans.length > 0 && !planUid) {
      setPlanUid(activePlans[0].uid);
    }
  }, [plans, planUid, setPlanUid]);

  // Auto-simulate when values change
  const simulateRef = useRef(simulate);

  useEffect(() => {
    simulateRef.current = simulate;
  });

  useEffect(() => {
    if (hypotheticalSale > 0 || accumulatedSales > 0) {
      simulateRef.current();
    }
  }, [hypotheticalSale, accumulatedSales, planUid]);

  const selectedPlan = plans.find((p) => p.uid === planUid);

  // Calcular cuánto falta para el siguiente tramo
  const siguienteTramo = (() => {
    if (!selectedPlan || selectedPlan.tiers.length <= 1) return null;
    const tiersSorted = [...selectedPlan.tiers].sort((a, b) => a.threshold - b.threshold);
    // tierApplied is 1-indexed from backend; if 0, we are below the first tier
    const currentIdx = tierApplied > 0 ? tierApplied - 1 : -1;
    if (currentIdx >= 0 && currentIdx < tiersSorted.length - 1) {
      const next = tiersSorted[currentIdx + 1];
      const falta = next.threshold - accumulatedSales;
      return { tramo: next, faltaMonto: Math.max(0, falta), numero: currentIdx + 2 };
    }
    return null;
  })();

  const mostrarResultado = (hypotheticalSale > 0 || accumulatedSales > 0) && totalCommission > 0;

  const planOptions = plans
    .filter((p) => p.is_active)
    .map((p) => ({ value: p.uid, label: p.name }));

  const noPlansAvailable = plans.filter((p) => p.is_active).length === 0;

  return (
    <PageContainer fluid className="pb-10 min-w-0 w-full space-y-6">
      <PageHeader
        title="Simulador de Comisión"
        subtitle="Ingresa un monto de venta hipotético y mira cómo se calcula tu comisión según tu plan actual"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Panel Izquierdo: Formulario */}
        <SectionCard className="flex flex-col gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Icon name="Calculator" size={18} className="text-blue-600" /> Parámetros de
              Simulación
            </h3>

            <SelectField
              value={planUid}
              onChange={(val) => setPlanUid(val as string)}
              label="Plan de Comisión"
              options={
                noPlansAvailable ? [{ value: '', label: '— No hay planes activos —' }] : planOptions
              }
            />

            <div className="space-y-2">
              <Input
                label="Ventas acumuladas en el periodo"
                hint="Ingresa las ventas ya realizadas en el mes actual"
                type="number"
                value={accumulatedSales || ''}
                onChange={(e) => setAccumulatedSales(Number(e.target.value))}
                placeholder="0.00"
                size="lg"
                leftIcon={<span className="text-muted-foreground font-medium">$</span>}
                inputClassName="text-lg"
              />
              {/* Indicador de tramo actual — feedback inmediato */}
              {currentTier && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm transition-colors">
                  <span className="text-indigo-500 font-bold">📍</span>
                  <span className="text-indigo-700 font-medium">{currentTier}</span>
                  <span className="text-indigo-500 text-xs ml-auto">
                    Comisión efectiva: {effectivePercentage}%
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-border/40">
              <Input
                label="Venta hipotética a simular"
                hint="¿Cuánto más esperas vender?"
                type="number"
                value={hypotheticalSale || ''}
                onChange={(e) => setHypotheticalSale(Number(e.target.value))}
                placeholder="0.00"
                size="lg"
                leftIcon={<span className="text-blue-600 font-bold">$</span>}
                inputClassName="border-2 border-blue-300 bg-blue-50 text-xl font-bold text-blue-900 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={resetForm}
            className="mt-2 w-full md:w-auto self-start"
          >
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Nueva Simulación
          </Button>

          {selectedPlan && (
            <div className="mt-4 bg-muted/20 p-4 rounded-lg border text-sm">
              <p className="font-semibold text-foreground mb-1">
                📋 Plan aplicado: &quot;{selectedPlan.name}&quot;
              </p>
              <p className="text-muted-foreground">
                Tipo:{' '}
                {selectedPlan.type === 'sale'
                  ? 'Por Venta'
                  : selectedPlan.type === 'margin'
                    ? 'Por Margen'
                    : 'Por Meta'}
              </p>
              <p className="text-muted-foreground">
                Base: {selectedPlan.base_percentage}% | Tramos: {selectedPlan.tiers.length}{' '}
                configurados
              </p>
              <a
                href="/hr/commissions/plans"
                className="text-blue-600 text-xs font-medium mt-2 inline-block hover:underline"
              >
                Ver detalle del plan →
              </a>
            </div>
          )}
        </SectionCard>

        {/* Panel Derecho: Resultados */}
        <div className="flex flex-col gap-6">
          <SectionCard className="flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Comisión Total Proyectada
            </h3>
            <div className="text-5xl font-extrabold text-blue-600 tracking-tight">
              {isSimulating ? '...' : `$${totalCommission.toLocaleString()}`}
            </div>
            <p className="text-sm text-muted-foreground mt-4 font-medium">
              Sobre la venta hipotética de ${hypotheticalSale?.toLocaleString() ?? '0'}
            </p>
          </SectionCard>

          <SectionCard noPadding>
            <div className="px-6 py-4 border-b bg-muted/20">
              <h3 className="text-h6 text-foreground">Resultado de la Simulación</h3>
            </div>

            {mostrarResultado ? (
              <div className="px-6 py-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ventas totales</span>
                  <span className="font-semibold text-foreground">
                    ${(accumulatedSales + hypotheticalSale).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tramo aplicado</span>
                  <span className="font-semibold text-foreground">Tramo {tierApplied || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Porcentaje efectivo</span>
                  <span className="font-semibold text-foreground">{effectivePercentage}%</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Comisión generada</span>
                  <span className="font-bold text-blue-600 text-lg">
                    ${totalCommission.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Icon name="Calculator" size={32} className="text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  Ingresa un monto para ver la simulación de tramos.
                </p>
              </div>
            )}
          </SectionCard>

          {/* Acordeón: ¿Cuánto más necesito para subir de tramo? */}
          {siguienteTramo && (
            <SectionCard noPadding>
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                onClick={() => setAcordeonAbierto(!acordeonAbierto)}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon name="Lightbulb" size={16} className="text-yellow-500" />
                  ¿Cuánto más necesito para subir de tramo?
                </span>
                {acordeonAbierto ? (
                  <Icon name="ChevronUp" size={16} className="text-muted-foreground" />
                ) : (
                  <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
                )}
              </button>

              {acordeonAbierto && (
                <div className="px-6 pb-5 space-y-4 border-t bg-yellow-50/40">
                  <p className="text-sm text-foreground pt-4">
                    Te faltan{' '}
                    <span className="font-bold text-yellow-700">
                      ${siguienteTramo.faltaMonto.toLocaleString()}
                    </span>{' '}
                    para entrar al <span className="font-bold">Tramo {siguienteTramo.numero}</span>{' '}
                    con{' '}
                    <span className="font-bold text-green-700">
                      {siguienteTramo.tramo.percent}%
                    </span>{' '}
                    de comisión.
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso hacia el siguiente tramo</span>
                      <span className="font-medium">
                        ${accumulatedSales.toLocaleString()} / $
                        {siguienteTramo.tramo.threshold?.toLocaleString() ?? '0'}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (accumulatedSales / siguienteTramo.tramo.threshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-foreground bg-background border rounded-lg px-3 py-2">
                    Si vendes{' '}
                    <span className="font-semibold">
                      ${siguienteTramo.faltaMonto.toLocaleString()}
                    </span>{' '}
                    más, tu tasa sube al{' '}
                    <span className="font-semibold text-green-700">
                      {siguienteTramo.tramo.percent}%
                    </span>{' '}
                    — eso significa{' '}
                    <span className="font-bold text-blue-700">
                      +$
                      {(siguienteTramo.faltaMonto * (siguienteTramo.tramo.percent / 100)).toFixed(
                        2
                      )}
                    </span>{' '}
                    de comisión adicional por cada peso nuevo en ese tramo.
                  </p>
                </div>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

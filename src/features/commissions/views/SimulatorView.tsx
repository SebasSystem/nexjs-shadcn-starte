'use client';

import React, { useState, useMemo } from 'react';
import { useSimulator } from 'src/features/commissions/hooks/use-simulator';
import { Button } from 'src/shared/components/ui/button';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Calculator, RefreshCw, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import {
  useTable,
  TableHeadCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';
import { createColumnHelper, flexRender } from '@tanstack/react-table';

type TramoDesglose = {
  tramoInfo: string;
  rangoTxt: string;
  porcentaje: number;
  montoQueEntraEnTramo: number;
  comisionGenerada: number;
};

const columnHelper = createColumnHelper<TramoDesglose>();

export const SimulatorView = () => {
  const [acordeonAbierto, setAcordeonAbierto] = useState(false);

  const {
    plan,
    ventasAcumuladas,
    setVentasAcumuladas,
    ventaHipotetica,
    setVentaHipotetica,
    desglose,
    totalComisionHipotetica,
    tramoActual,
    resetForm,
  } = useSimulator();

  // Calcular cuánto falta para el siguiente tramo
  const siguienteTramo = (() => {
    if (!tramoActual || tramoActual.hasta === null) return null;
    const tramosOrdenados = [...plan.tramos].sort((a, b) => a.desde - b.desde);
    const idxActual = tramosOrdenados.findIndex((t) => t.id === tramoActual.id);
    if (idxActual === -1 || idxActual >= tramosOrdenados.length - 1) return null;
    const siguiente = tramosOrdenados[idxActual + 1];
    const falta = tramoActual.hasta + 1 - ventasAcumuladas;
    return { tramo: siguiente, faltaMonto: Math.max(0, falta), numero: idxActual + 2 };
  })();

  const mostrarDesglose = ventaHipotetica > 0 || ventasAcumuladas > 0;

  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('tramoInfo', {
        header: 'Tramo / Rango',
        cell: (info) => {
          const row = info.row.original;
          const aplica = row.montoQueEntraEnTramo > 0;
          return (
            <div>
              <div
                className={`font-medium ${aplica ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {info.getValue()}
              </div>
              <div className="text-xs text-muted-foreground">{row.rangoTxt}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor('porcentaje', {
        header: 'Apl. %',
        cell: (info) => (
          <div className="text-center font-medium text-muted-foreground">{info.getValue()}%</div>
        ),
      }),
      columnHelper.accessor('montoQueEntraEnTramo', {
        header: 'Monto en Tramo',
        cell: (info) => (
          <div className="text-right text-muted-foreground">
            ${info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('comisionGenerada', {
        header: 'Comisión',
        cell: (info) => (
          <div className="text-right font-bold text-blue-600">
            ${info.getValue().toLocaleString()}
          </div>
        ),
      }),
    ],
    []
  );

  const { table } = useTable({
    data: desglose,
    columns: COLUMNS,
    // Disable pagination completely to show all tramos
    defaultRowsPerPage: 100,
  });

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
              <Calculator size={18} className="text-blue-600" /> Parámetros de Simulación
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Ventas acumuladas en el periodo
                <p className="text-xs font-normal text-muted-foreground mt-1 mb-2">
                  Ingresa las ventas ya realizadas en el mes actual
                </p>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={ventasAcumuladas || ''}
                  onChange={(e) => setVentasAcumuladas(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full h-11 pl-8 pr-3 border border-border/40 rounded-lg bg-background focus:ring-2 focus:ring-blue-500 text-lg transition-shadow"
                />
              </div>
              {/* Indicador de tramo actual — feedback inmediato */}
              {tramoActual && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm transition-colors">
                  <span className="text-indigo-500 font-bold">📍</span>
                  <span className="text-indigo-700 font-medium">
                    Estás en Tramo {tramoActual.numero} — {tramoActual.porcentajeAplicado}% de
                    comisión
                  </span>
                  <span className="text-indigo-500 text-xs ml-auto">
                    ${tramoActual.desde.toLocaleString()} –{' '}
                    {tramoActual.hasta ? '$' + tramoActual.hasta.toLocaleString() : '∞'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-border/40">
              <label className="text-sm font-bold text-blue-900">
                Venta hipotética a simular
                <p className="text-xs font-normal text-blue-700/70 mt-1 mb-2">
                  ¿Cuánto más esperas vender?
                </p>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-blue-600 font-bold">$</span>
                <input
                  type="number"
                  value={ventaHipotetica || ''}
                  onChange={(e) => setVentaHipotetica(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full h-12 pl-8 pr-3 border-2 border-blue-300 bg-blue-50 rounded-lg text-xl font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={resetForm}
            className="mt-2 w-full md:w-auto self-start"
          >
            <RefreshCw size={16} className="mr-2" />
            Nueva Simulación
          </Button>

          <div className="mt-4 bg-muted/20 p-4 rounded-lg border text-sm">
            <p className="font-semibold text-foreground mb-1">
              📋 Plan aplicado: &quot;{plan.nombre}&quot;
            </p>
            <p className="text-muted-foreground">
              Tipo: {plan.tipo === 'VENTA' ? 'Por Venta' : plan.tipo}
            </p>
            <p className="text-muted-foreground">
              Base: {plan.porcentajeBase}% | Tramos: {plan.tramos.length} configurados
            </p>
            <a
              href="/hr/commissions/plans"
              className="text-blue-600 text-xs font-medium mt-2 inline-block hover:underline"
            >
              Ver detalle del plan →
            </a>
          </div>
        </SectionCard>

        {/* Panel Derecho: Resultados */}
        <div className="flex flex-col gap-6">
          <SectionCard className="flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Comisión Total Proyectada
            </h3>
            <div className="text-5xl font-extrabold text-blue-600 tracking-tight">
              ${totalComisionHipotetica.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-4 font-medium">
              Sobre la venta hipotética de ${ventaHipotetica.toLocaleString()}
            </p>
          </SectionCard>

          <SectionCard noPadding>
            <div className="px-6 py-4 border-b bg-muted/20">
              <h3 className="text-h6 text-foreground">Desglose por Tramos</h3>
            </div>

            {mostrarDesglose ? (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeadCustom table={table} />
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-6 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    <TableRow className="bg-blue-50/50 border-t-2 border-blue-100 hover:bg-blue-50/50">
                      <TableCell
                        colSpan={2}
                        className="px-6 py-4 font-bold text-foreground text-right"
                      >
                        TOTAL
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-medium text-muted-foreground">
                        ${ventaHipotetica.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-bold text-blue-600 text-lg">
                        ${totalComisionHipotetica.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Calculator size={32} className="text-muted-foreground/30 mb-3" />
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
                  <Lightbulb size={16} className="text-yellow-500" />
                  ¿Cuánto más necesito para subir de tramo?
                </span>
                {acordeonAbierto ? (
                  <ChevronUp size={16} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={16} className="text-muted-foreground" />
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
                      {siguienteTramo.tramo.porcentajeAplicado}%
                    </span>{' '}
                    de comisión.
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso hacia el siguiente tramo</span>
                      <span className="font-medium">
                        ${ventasAcumuladas.toLocaleString()} / $
                        {siguienteTramo.tramo.desde.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (ventasAcumuladas / siguienteTramo.tramo.desde) * 100)}%`,
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
                      {siguienteTramo.tramo.porcentajeAplicado}%
                    </span>{' '}
                    — eso significa{' '}
                    <span className="font-bold text-blue-700">
                      +$
                      {(
                        siguienteTramo.faltaMonto *
                        (siguienteTramo.tramo.porcentajeAplicado / 100)
                      ).toFixed(2)}
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

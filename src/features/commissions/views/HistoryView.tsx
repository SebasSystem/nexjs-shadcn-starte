'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useHistory } from 'src/features/commissions/hooks/use-history';
import { Button } from 'src/shared/components/ui/button';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { FileDown, Search, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';
import { cn } from 'src/lib/utils';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import { toast } from 'sonner';

// Mock detail data por registro
const MOCK_DETALLES: Record<
  string,
  {
    ventas: { fecha: string; cliente: string; monto: number }[];
    desglose: {
      tramo: string;
      rango: string;
      porcentaje: number;
      monto: number;
      comision: number;
    }[];
    timeline: { accion: string; actor: string; fecha: string }[];
  }
> = {
  'reg-1': {
    ventas: [
      { fecha: '10/02/2025', cliente: 'Distribuidora Alfa', monto: 5000 },
      { fecha: '22/02/2025', cliente: 'Comercial Beta S.A.', monto: 3040 },
    ],
    desglose: [
      { tramo: 'Tramo 1', rango: '$0 – $5,000', porcentaje: 3, monto: 5000, comision: 150 },
      { tramo: 'Tramo 2', rango: '$5,001 – $10,000', porcentaje: 5, monto: 3040, comision: 152 },
    ],
    timeline: [
      { accion: 'Creado', actor: 'Sistema', fecha: '01/03/2025' },
      { accion: 'Pendiente de aprobación', actor: 'Sistema', fecha: '01/03/2025' },
    ],
  },
  'reg-2': {
    ventas: [
      { fecha: '05/02/2025', cliente: 'TechCorp Ltda.', monto: 10000 },
      { fecha: '18/02/2025', cliente: 'Soluciones Gamma', monto: 2500 },
    ],
    desglose: [
      { tramo: 'Tramo 1', rango: '$0 – $5,000', porcentaje: 3, monto: 5000, comision: 150 },
      { tramo: 'Tramo 2', rango: '$5,001 – $10,000', porcentaje: 5, monto: 5000, comision: 250 },
      { tramo: 'Tramo 3', rango: '$10,001+', porcentaje: 8, monto: 2500, comision: 200 },
    ],
    timeline: [
      { accion: 'Creado', actor: 'Sistema', fecha: '01/03/2025' },
      { accion: 'Aprobado', actor: 'Admin RH', fecha: '05/03/2025' },
    ],
  },
  'reg-3': {
    ventas: [
      { fecha: '12/01/2025', cliente: 'Grupo Delta', monto: 5000 },
      { fecha: '25/01/2025', cliente: 'Empresa Epsilon', monto: 4200 },
    ],
    desglose: [
      { tramo: 'Tramo 1', rango: '$0 – $5,000', porcentaje: 3, monto: 5000, comision: 150 },
      { tramo: 'Tramo 2', rango: '$5,001 – $10,000', porcentaje: 5, monto: 4200, comision: 210 },
    ],
    timeline: [
      { accion: 'Creado', actor: 'Sistema', fecha: '01/02/2025' },
      { accion: 'Aprobado', actor: 'Admin RH', fecha: '03/02/2025' },
      { accion: 'Pagado', actor: 'Admin RH', fecha: '15/02/2025' },
    ],
  },
};

type RegistroHistory = ReturnType<typeof useHistory>['registros'][0];
const columnHelper = createColumnHelper<RegistroHistory>();

export const HistoryView = () => {
  const { registros, isLoading, cambiarEstado } = useHistory();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // States for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  // Mini-modal PDF
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfGenerando, setPdfGenerando] = useState(false);
  const [pdfOpciones, setPdfOpciones] = useState({
    detalleVentas: true,
    desgloseTramos: true,
    resumenEjecutivo: false,
  });

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === registros.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(registros.map((r) => r.id));
    }
  }, [selectedIds.length, registros]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleGenerarPDF = async () => {
    setPdfGenerando(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPdfGenerando(false);
    setPdfModalOpen(false);
    toast.success('Reporte listo. [Descargar PDF]');
  };

  const allSelected = registros.length > 0 && selectedIds.length === registros.length;

  const COLUMNS = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            className="rounded border-input text-primary focus:ring-primary"
            onChange={handleSelectAll}
            checked={allSelected}
          />
        ),
        cell: (info) => (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="rounded border-input text-primary focus:ring-primary"
              checked={selectedIds.includes(info.row.original.id)}
              onChange={() => toggleSelect(info.row.original.id)}
            />
          </div>
        ),
      }),
      columnHelper.accessor('vendedorNombre', {
        header: 'Vendedor',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
              {info.getValue().charAt(0)}
            </div>
            <span className="font-medium text-foreground">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('periodo', {
        header: 'Periodo',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('ventasPeriodo', {
        header: 'Ventas',
        cell: (info) => (
          <span className="text-foreground">${info.getValue().toLocaleString()}</span>
        ),
      }),
      columnHelper.accessor('planAplicado', {
        header: 'Plan',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('comisionCalculada', {
        header: 'Comisión',
        cell: (info) => (
          <div className="text-right font-bold text-foreground">
            ${info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => {
          const st = info.getValue();
          if (st === 'PENDIENTE')
            return (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Pendiente
              </span>
            );
          if (st === 'APROBADO')
            return (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Aprobado
              </span>
            );
          if (st === 'PAGADO')
            return (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Pagado
              </span>
            );
          return null;
        },
      }),
      columnHelper.display({
        id: 'detalle',
        header: 'Detalle',
        cell: (info) => {
          const isExpanded = expandedId === info.row.original.id;
          return (
            <div className="text-center w-full flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(info.row.original.id);
                }}
                className="text-muted-foreground hover:text-blue-600 transition-colors p-1 rounded"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          );
        },
      }),
    ],
    [selectedIds, allSelected, expandedId, handleSelectAll]
  );

  const filteredRegistros = useMemo(() => {
    return registros.filter((r) => {
      const matchSearch = r.vendedorNombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPeriodo = periodoFilter ? r.periodo === periodoFilter : true;
      const matchEstado = estadoFilter ? r.estado === estadoFilter : true;
      return matchSearch && matchPeriodo && matchEstado;
    });
  }, [registros, searchTerm, periodoFilter, estadoFilter]);

  const { table, dense, onChangeDense } = useTable({
    data: filteredRegistros,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  const pendientes = registros.filter((r) => r.estado === 'PENDIENTE');
  const sumaPendientes = pendientes.reduce((acc, r) => acc + r.comisionCalculada, 0);
  const aprobados = registros.filter((r) => r.estado === 'APROBADO');
  const sumaAprobados = aprobados.reduce((acc, r) => acc + r.comisionCalculada, 0);
  const pagados = registros.filter((r) => r.estado === 'PAGADO');
  const sumaPagados = pagados.reduce((acc, r) => acc + r.comisionCalculada, 0);

  const seleccionPendientes = selectedIds.filter((id) => pendientes.find((r) => r.id === id));
  const seleccionAprobados = selectedIds.filter((id) => aprobados.find((r) => r.id === id));

  return (
    <PageContainer fluid className="pb-20 min-w-0 w-full space-y-6">
      <PageHeader
        title="Historial y Liquidación"
        subtitle="Revisa el historial de comisiones y gestiona el proceso de aprobación y pago"
        action={
          <Button
            onClick={() => setPdfModalOpen(true)}
            variant="outline"
            className="border-gray-300"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Generar Reporte PDF
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard className="flex justify-between items-center border-l-4 border-l-yellow-400">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Comisiones Pendientes</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">
              ${sumaPendientes.toLocaleString()}
            </p>
          </div>
          <div className="bg-yellow-50 text-yellow-600 px-3 py-1 text-sm rounded-full font-bold">
            {pendientes.length}
          </div>
        </SectionCard>
        <SectionCard className="flex justify-between items-center border-l-4 border-l-green-400">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Comisiones Aprobadas</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">
              ${sumaAprobados.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 text-green-600 px-3 py-1 text-sm rounded-full font-bold">
            {aprobados.length}
          </div>
        </SectionCard>
        <SectionCard className="flex justify-between items-center border-l-4 border-l-blue-400">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Comisiones Pagadas</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">${sumaPagados.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 text-sm rounded-full font-bold">
            {pagados.length}
          </div>
        </SectionCard>
      </div>

      <SectionCard noPadding>
        {/* Filtros Integrados */}
        <div className="flex gap-4 flex-wrap items-center p-4 bg-muted/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Buscar vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <select
            value={periodoFilter}
            onChange={(e) => setPeriodoFilter(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background min-w-[150px] focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos los periodos</option>
            <option value="Febrero 2025">Febrero 2025</option>
            <option value="Enero 2025">Enero 2025</option>
          </select>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background min-w-[150px] focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="PAGADO">Pagado</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSearchTerm('');
              setPeriodoFilter('');
              setEstadoFilter('');
            }}
          >
            Limpiar Filtros
          </Button>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="p-10 flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <div className="overflow-x-auto">
              <Table>
                <TableHeadCustom table={table} />
                <TableBody dense={dense}>
                  {table.getRowModel().rows.map((row) => {
                    const isExpanded = expandedId === row.original.id;
                    const detalle = MOCK_DETALLES[row.original.id];

                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          className={cn(
                            'transition-colors cursor-pointer',
                            isExpanded && 'bg-blue-50/30'
                          )}
                          onClick={() => toggleExpand(row.original.id)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className={!dense ? 'py-4' : undefined}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>

                        {/* Fila expandible */}
                        {isExpanded && detalle && (
                          <TableRow>
                            <TableCell
                              colSpan={row.getVisibleCells().length}
                              className="bg-muted/10 p-0"
                            >
                              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Ventas del periodo */}
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Ventas del Periodo
                                  </h4>
                                  <Table>
                                    <thead className="text-muted-foreground">
                                      <tr>
                                        <th className="text-left font-medium text-xs py-2">
                                          Fecha
                                        </th>
                                        <th className="text-left font-medium text-xs py-2">
                                          Cliente
                                        </th>
                                        <th className="text-right font-medium text-xs py-2">
                                          Monto
                                        </th>
                                      </tr>
                                    </thead>
                                    <TableBody>
                                      {detalle.ventas.map((v, i) => (
                                        <TableRow key={i}>
                                          <TableCell className="py-2 text-xs text-muted-foreground">
                                            {v.fecha}
                                          </TableCell>
                                          <TableCell className="py-2 text-xs font-medium text-foreground">
                                            {v.cliente}
                                          </TableCell>
                                          <TableCell className="py-2 text-xs text-right font-semibold">
                                            ${v.monto.toLocaleString()}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Desglose por tramos */}
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Desglose por Tramos
                                  </h4>
                                  <Table>
                                    <thead className="text-muted-foreground">
                                      <tr>
                                        <th className="text-left font-medium text-xs py-2">
                                          Tramo
                                        </th>
                                        <th className="text-center font-medium text-xs py-2">%</th>
                                        <th className="text-right font-medium text-xs py-2">
                                          Comisión
                                        </th>
                                      </tr>
                                    </thead>
                                    <TableBody>
                                      {detalle.desglose.map((d, i) => (
                                        <TableRow key={i}>
                                          <TableCell className="py-2">
                                            <div className="font-medium text-xs text-foreground">
                                              {d.tramo}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                              {d.rango}
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-2 text-center text-xs text-muted-foreground">
                                            {d.porcentaje}%
                                          </TableCell>
                                          <TableCell className="py-2 text-right text-xs font-bold text-blue-600">
                                            ${d.comision.toLocaleString()}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow>
                                        <TableCell
                                          colSpan={2}
                                          className="py-2 font-bold text-xs text-foreground text-right pr-2"
                                        >
                                          Total
                                        </TableCell>
                                        <TableCell className="py-2 text-right text-xs font-bold text-blue-700">
                                          ${row.original.comisionCalculada.toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Timeline de estados */}
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Historial de Estados
                                  </h4>
                                  <div className="space-y-3">
                                    {detalle.timeline.map((t, i) => (
                                      <div key={i} className="flex gap-3 items-start">
                                        <div className="flex flex-col items-center">
                                          <div
                                            className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${
                                              i === detalle.timeline.length - 1
                                                ? 'bg-blue-500'
                                                : 'bg-muted-foreground/30'
                                            }`}
                                          />
                                          {i < detalle.timeline.length - 1 && (
                                            <div className="w-px bg-border mt-1 min-h-[16px] flex-1" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-xs font-semibold text-foreground">
                                            {t.accion}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {t.actor} · {t.fecha}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-border/40">
              <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
            </div>
          </div>
        )}
      </SectionCard>

      {/* Barra flotante selección */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-5 z-[50]">
          <span className="font-medium text-sm">
            {selectedIds.length}{' '}
            {selectedIds.length === 1 ? 'registro seleccionado' : 'registros seleccionados'}
          </span>
          <div className="flex gap-2 border-l border-gray-700 pl-6">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={seleccionPendientes.length === 0}
              onClick={() => cambiarEstado(seleccionPendientes, 'APROBADO')}
            >
              Aprobar ({seleccionPendientes.length})
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              disabled={seleccionAprobados.length === 0}
              onClick={() => cambiarEstado(seleccionAprobados, 'PAGADO')}
            >
              Marcar Pagados ({seleccionAprobados.length})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setSelectedIds([])}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Drawer PDF */}
      <Sheet
        open={pdfModalOpen}
        onOpenChange={(v) => !v && !pdfGenerando && setPdfModalOpen(false)}
      >
        <SheetContent side="right" className="sm:max-w-[380px] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-blue-600 shrink-0" />
              <div>
                <SheetTitle>Generar Reporte PDF</SheetTitle>
                <SheetDescription>Configura las opciones del reporte</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
            <div className="py-6 space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Periodo</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option>Febrero 2025</option>
                  <option>Enero 2025</option>
                  <option>Todos los periodos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Incluir</label>
                {[
                  { key: 'detalleVentas', label: 'Detalle de ventas' },
                  { key: 'desgloseTramos', label: 'Desglose por tramos' },
                  { key: 'resumenEjecutivo', label: 'Resumen ejecutivo' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pdfOpciones[key as keyof typeof pdfOpciones]}
                      onChange={(e) =>
                        setPdfOpciones((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPdfModalOpen(false)}
              disabled={pdfGenerando}
            >
              Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleGenerarPDF}
              disabled={pdfGenerando}
            >
              {pdfGenerando ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generando...
                </span>
              ) : (
                'Generar PDF'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
};

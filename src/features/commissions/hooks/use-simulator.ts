import { useState, useMemo } from 'react';
import type { PlanComision } from '../types/commissions.types';

// Simulamos que el usuario logueado en el simulador ya tiene este plan activo
const PLAN_MOCK: PlanComision = {
  id: 'plan-1',
  nombre: 'Plan Élite 2025',
  tipo: 'VENTA',
  porcentajeBase: 3,
  estado: 'ACTIVO',
  fechaInicio: '2025-01-01',
  rolesAplicables: ['Senior', 'Junior'],
  tramos: [
    { id: 't1', desde: 0, hasta: 5000, porcentajeAplicado: 3 },
    { id: 't2', desde: 5001, hasta: 10000, porcentajeAplicado: 5 },
    { id: 't3', desde: 10001, hasta: null, porcentajeAplicado: 8 },
  ],
};

interface DesgloseTramo {
  tramoInfo: string;
  rangoTxt: string;
  porcentaje: number;
  montoQueEntraEnTramo: number;
  comisionGenerada: number;
}

export const useSimulator = () => {
  const [ventasAcumuladas, setVentasAcumuladas] = useState<number>(0);
  const [ventaHipotetica, setVentaHipotetica] = useState<number>(0);

  const plan = PLAN_MOCK;

  const desglose = useMemo<DesgloseTramo[]>(() => {
    if (!plan || !plan.tramos.length) return [];

    let hipoteticaRestante = ventaHipotetica;

    // Calculamos el inicio del análisis de la venta nueva
    const inicioVentaHipotetica = ventasAcumuladas;

    const resultado: DesgloseTramo[] = [];

    // Recorremos cada tramo en orden
    // Importante: la comisión solo cuenta la venta hipotetica,
    // pero la venta acumulada nos ubica en algún tramo.

    // Ordenamos los tramos para asegurarnos
    const tramosOrdenados = [...plan.tramos].sort((a, b) => a.desde - b.desde);

    for (let i = 0; i < tramosOrdenados.length; i++) {
      const tramo = tramosOrdenados[i];

      let capacidadTramo = tramo.hasta ? tramo.hasta - tramo.desde + 1 : Infinity;
      // Si desde no es 0
      if (tramo.desde > 0 && tramo.hasta !== null) {
        capacidadTramo = tramo.hasta - tramo.desde; // Aproximación para los rangos continuos
      }

      // ¿Cuánto de "ventasAcumuladas" se come este tramo?
      let ocupadoPorAcumuladas = 0;

      if (inicioVentaHipotetica >= tramo.desde) {
        if (tramo.hasta !== null && inicioVentaHipotetica > tramo.hasta) {
          ocupadoPorAcumuladas = capacidadTramo;
        } else {
          ocupadoPorAcumuladas = inicioVentaHipotetica - tramo.desde;
        }
      }

      const espacioDisponibleEnTramo = Math.max(0, capacidadTramo - ocupadoPorAcumuladas);

      // Verificamos de la venta hipotética cuánto puede entrar aquí
      const entraEnTramoHipotetico = Math.min(hipoteticaRestante, espacioDisponibleEnTramo);

      hipoteticaRestante -= entraEnTramoHipotetico;

      resultado.push({
        tramoInfo: `Tramo ${i + 1}`,
        rangoTxt: `$${tramo.desde.toLocaleString()} - ${tramo.hasta ? '$' + tramo.hasta.toLocaleString() : '∞'}`,
        porcentaje: tramo.porcentajeAplicado,
        montoQueEntraEnTramo: entraEnTramoHipotetico,
        comisionGenerada: entraEnTramoHipotetico * (tramo.porcentajeAplicado / 100),
      });
    }

    return resultado;
  }, [plan, ventasAcumuladas, ventaHipotetica]);

  const totalComisionHipotetica = useMemo(() => {
    return desglose.reduce((acc, obj) => acc + obj.comisionGenerada, 0);
  }, [desglose]);

  // Tramo en el que se ubican las ventas acumuladas actualmente

  const getTramoActual = () => {
    if (!ventasAcumuladas || ventasAcumuladas <= 0) return null;
    const tramosOrdenados = [...plan.tramos].sort((a, b) => a.desde - b.desde);
    for (let i = 0; i < tramosOrdenados.length; i++) {
      const tramo = tramosOrdenados[i];
      if (tramo.hasta === null || ventasAcumuladas <= tramo.hasta) {
        return { ...tramo, numero: i + 1 };
      }
    }
    return null;
  };
  const tramoActual = getTramoActual();

  const resetForm = () => {
    setVentasAcumuladas(0);
    setVentaHipotetica(0);
  };

  return {
    plan,
    ventasAcumuladas,
    setVentasAcumuladas,
    ventaHipotetica,
    setVentaHipotetica,
    desglose,
    totalComisionHipotetica,
    tramoActual,
    resetForm,
  };
};

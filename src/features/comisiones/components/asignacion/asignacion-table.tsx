'use client';

import React from 'react';
import type { AsignacionPlan } from '../../types/comisiones.types';
import { format } from 'date-fns';

interface AsignacionTableProps {
  asignaciones: AsignacionPlan[];
  isLoading: boolean;
  onEdit: (asignacion: AsignacionPlan) => void;
  onToggleStatus: (id: string, nuevoEstado: string) => void;
}

export const AsignacionTable: React.FC<AsignacionTableProps> = ({
  asignaciones,
  isLoading,
  onEdit,
  onToggleStatus,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (!asignaciones.length) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <h3 className="text-lg font-medium">No hay vendedores asignados</h3>
      </div>
    );
  }

  const renderBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Activo
          </span>
        );
      case 'INACTIVO':
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Inactivo
          </span>
        );
      case 'SIN_ASIGNAR':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Sin Asignar
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3">Vendedor</th>
            <th className="px-4 py-3">Equipo</th>
            <th className="px-4 py-3">Plan Asignado</th>
            <th className="px-4 py-3">Vigencia</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((asg) => (
            <tr key={asg.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {asg.vendedorNombre.charAt(0)}
                </div>
                {asg.vendedorNombre}
              </td>
              <td className="px-4 py-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  {asg.equipoNombre}
                </span>
              </td>
              <td
                className={`px-4 py-4 ${asg.estado === 'SIN_ASIGNAR' ? 'text-gray-400 italic' : 'font-medium'}`}
              >
                {asg.planNombre || '— Sin plan asignado'}
              </td>
              <td className="px-4 py-4 text-gray-500">
                {asg.fechaInicio ? format(new Date(asg.fechaInicio), 'dd/MM/yyyy') : '—'}
                {asg.fechaFin ? ` - ${format(new Date(asg.fechaFin), 'dd/MM/yyyy')}` : ''}
              </td>
              <td className="px-4 py-4">{renderBadge(asg.estado)}</td>
              <td className="px-4 py-4 text-right space-x-2">
                {asg.estado === 'SIN_ASIGNAR' ? (
                  <button
                    onClick={() => onEdit(asg)}
                    className="text-blue-600 border border-blue-600 px-3 py-1 rounded-md text-xs hover:bg-blue-50 transition-colors"
                  >
                    Asignar Plan
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(asg)}
                      className="text-gray-500 hover:text-blue-600 px-2 py-1 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        onToggleStatus(asg.id, asg.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO')
                      }
                      className={`px-3 py-1 rounded-md text-xs border ${asg.estado === 'ACTIVO' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                    >
                      {asg.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

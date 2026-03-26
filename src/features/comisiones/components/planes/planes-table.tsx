'use client';

import React from 'react';
import { type PlanComision } from '../../types/comisiones.types';
import { Edit, Copy, MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface PlanesTableProps {
  planes: PlanComision[];
  isLoading: boolean;
  onEdit: (plan: PlanComision) => void;
}

export const PlanesTable: React.FC<PlanesTableProps> = ({ planes, isLoading, onEdit }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (!planes.length) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <MoreVertical className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium">Aún no hay planes configurados</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">Crea tu primer plan de comisión.</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
          Crear Plan
        </button>
      </div>
    );
  }

  const renderBadge = (tipo: string) => {
    switch (tipo) {
      case 'VENTA':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Por Venta
          </span>
        );
      case 'MARGEN':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Por Margen
          </span>
        );
      case 'META':
        return (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Por Meta
          </span>
        );
      default:
        return null;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 w-8"></th>
            <th className="px-4 py-3">Nombre del Plan</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Base</th>
            <th className="px-4 py-3">Tramos</th>
            <th className="px-4 py-3">Rol Aplicable</th>
            <th className="px-4 py-3">Vigencia</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {planes.map((plan) => (
            <React.Fragment key={plan.id}>
              <tr
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleExpand(plan.id)}
              >
                <td className="px-4 py-4 text-gray-400">
                  {expandedId === plan.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </td>
                <td className="px-4 py-4 font-medium text-gray-900">{plan.nombre}</td>
                <td className="px-4 py-4">{renderBadge(plan.tipo)}</td>
                <td className="px-4 py-4 font-medium">{plan.porcentajeBase}%</td>
                <td className="px-4 py-4">{plan.tramos.length} config.</td>
                <td className="px-4 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {plan.rolesAplicables.map((role) => (
                      <span
                        key={role}
                        className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded border"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-500">
                  {format(new Date(plan.fechaInicio), 'dd/MM/yyyy')}
                  {plan.fechaFin
                    ? ` - ${format(new Date(plan.fechaFin), 'dd/MM/yyyy')}`
                    : ' - Indefinido'}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      plan.estado === 'ACTIVO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {plan.estado}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onEdit(plan)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === plan.id && (
                <tr className="bg-gray-50 border-b">
                  <td colSpan={9} className="px-8 py-4">
                    <div className="max-w-xl bg-white border rounded-lg p-4 shadow-sm">
                      <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">
                        Escalones de Comisión
                      </h4>
                      <table className="w-full text-sm">
                        <thead className="text-gray-500 border-b">
                          <tr>
                            <th className="text-left py-2 font-medium">Desde</th>
                            <th className="text-left py-2 font-medium">Hasta</th>
                            <th className="text-right py-2 font-medium">% Aplicado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.tramos.map((tramo, index) => (
                            <tr
                              key={tramo.id || index}
                              className="border-b last:border-0 hover:bg-gray-50"
                            >
                              <td className="py-2.5">${tramo.desde.toLocaleString()}</td>
                              <td className="py-2.5">
                                {tramo.hasta ? `$${tramo.hasta.toLocaleString()}` : 'Sin límite'}
                              </td>
                              <td className="py-2.5 text-right font-medium text-blue-600">
                                {tramo.porcentajeAplicado}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

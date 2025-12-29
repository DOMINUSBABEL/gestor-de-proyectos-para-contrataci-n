import React, { useCallback } from 'react';
import { Risk, RiskLevel } from '../types';
import { IconPlus, IconTrash } from './Icons';

interface RiskMatrixProps {
  risks: Risk[];
  onChange: (risks: Risk[]) => void;
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks, onChange }) => {
  const addRisk = () => {
    const newRisk: Risk = {
      id: crypto.randomUUID(),
      description: "Nuevo riesgo",
      consequence: "Consecuencia...",
      probability: 1,
      impact: 1,
      level: RiskLevel.BAJO,
      treatment: "Mitigación",
      responsible: "Contratista"
    };
    onChange([...risks, newRisk]);
  };

  const removeRisk = (id: string) => {
    onChange(risks.filter(r => r.id !== id));
  };

  const updateRisk = (id: string, field: keyof Risk, value: any) => {
    const updatedRisks = risks.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        // Recalculate level based on simple matrix logic
        if (field === 'probability' || field === 'impact') {
          const score = updated.probability * updated.impact;
          if (score <= 4) updated.level = RiskLevel.BAJO;
          else if (score <= 10) updated.level = RiskLevel.MEDIO;
          else if (score <= 18) updated.level = RiskLevel.ALTO;
          else updated.level = RiskLevel.EXTREMO;
        }
        return updated;
      }
      return r;
    });
    onChange(updatedRisks);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Matriz de Riesgos (Previsible)</h3>
        <button
          onClick={addRisk}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <IconPlus className="w-4 h-4" /> Agregar Riesgo
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Consecuencia</th>
              <th className="px-2 py-3 w-16">Prob (1-5)</th>
              <th className="px-2 py-3 w-16">Imp (1-5)</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Tratamiento</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-2 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-2">
                  <textarea
                    className="w-full bg-white text-slate-900 border-gray-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    value={risk.description}
                    onChange={(e) => updateRisk(risk.id, 'description', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <textarea
                     className="w-full bg-white text-slate-900 border-gray-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                     rows={2}
                     value={risk.consequence}
                     onChange={(e) => updateRisk(risk.id, 'consequence', e.target.value)}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="w-full bg-white text-slate-900 border-gray-200 rounded text-center"
                    value={risk.probability}
                    onChange={(e) => updateRisk(risk.id, 'probability', parseInt(e.target.value))}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="w-full bg-white text-slate-900 border-gray-200 rounded text-center"
                    value={risk.impact}
                    onChange={(e) => updateRisk(risk.id, 'impact', parseInt(e.target.value))}
                  />
                </td>
                <td className="px-4 py-2 font-semibold">
                  <span className={`px-2 py-1 rounded text-xs ${
                    risk.level === RiskLevel.BAJO ? 'bg-green-100 text-green-800' :
                    risk.level === RiskLevel.MEDIO ? 'bg-yellow-100 text-yellow-800' :
                    risk.level === RiskLevel.ALTO ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {risk.level}
                  </span>
                </td>
                <td className="px-4 py-2">
                    <select 
                        value={risk.treatment} 
                        onChange={(e) => updateRisk(risk.id, 'treatment', e.target.value)}
                        className="w-full bg-white text-slate-900 border-gray-200 rounded text-sm"
                    >
                        <option>Mitigación</option>
                        <option>Transferencia</option>
                        <option>Aceptación</option>
                        <option>Evitación</option>
                    </select>
                </td>
                <td className="px-4 py-2">
                    <select 
                        value={risk.responsible} 
                        onChange={(e) => updateRisk(risk.id, 'responsible', e.target.value)}
                        className="w-full bg-white text-slate-900 border-gray-200 rounded text-sm"
                    >
                        <option>Entidad</option>
                        <option>Contratista</option>
                        <option>Compartido</option>
                    </select>
                </td>
                <td className="px-2 py-2">
                  <button onClick={() => removeRisk(risk.id)} className="text-red-500 hover:text-red-700">
                    <IconTrash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {risks.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                  No hay riesgos definidos. Usa el botón "Agregar Riesgo" o la IA para sugerir.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskMatrix;
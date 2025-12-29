import React from 'react';
import { Deliverable } from '../types';
import { IconPlus, IconTrash, IconBox } from './Icons';

interface DeliverablesEditorProps {
  deliverables: Deliverable[];
  onChange: (deliverables: Deliverable[]) => void;
}

const DeliverablesEditor: React.FC<DeliverablesEditorProps> = ({ deliverables, onChange }) => {
  const addDeliverable = () => {
    const newDel: Deliverable = {
      id: crypto.randomUUID(),
      name: "Nuevo Entregable",
      description: "",
      acceptanceCriteria: "Cumplimiento al 100% de especificaciones técnicas."
    };
    onChange([...deliverables, newDel]);
  };

  const removeDeliverable = (id: string) => {
    onChange(deliverables.filter(d => d.id !== id));
  };

  const updateDeliverable = (id: string, field: keyof Deliverable, value: any) => {
    onChange(deliverables.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Entregables del Proyecto</h3>
        <button
          onClick={addDeliverable}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <IconPlus className="w-4 h-4" /> Agregar Entregable
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliverables.map((del) => (
          <div key={del.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
            <button 
                onClick={() => removeDeliverable(del.id)} 
                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <IconTrash className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 mb-3">
                <IconBox className="w-5 h-5 text-indigo-500" />
                <input
                  type="text"
                  value={del.name}
                  onChange={(e) => updateDeliverable(del.id, 'name', e.target.value)}
                  className="font-semibold text-slate-900 bg-white border-none p-0 focus:ring-0 w-full placeholder:text-slate-300"
                  placeholder="Nombre del entregable"
                />
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Descripción</label>
                    <textarea
                        value={del.description}
                        onChange={(e) => updateDeliverable(del.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full text-sm border-slate-200 text-slate-900 bg-white rounded mt-1"
                        placeholder="¿En qué consiste este entregable?"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Criterios de Aceptación</label>
                    <textarea
                        value={del.acceptanceCriteria}
                        onChange={(e) => updateDeliverable(del.id, 'acceptanceCriteria', e.target.value)}
                        rows={2}
                        className="w-full text-sm border-slate-200 text-slate-900 bg-white rounded mt-1"
                        placeholder="Condiciones para pago/recibo"
                    />
                </div>
            </div>
          </div>
        ))}
         {deliverables.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-400">No hay entregables definidos.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DeliverablesEditor;
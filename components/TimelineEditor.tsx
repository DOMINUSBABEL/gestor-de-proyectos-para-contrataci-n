import React from 'react';
import { Activity } from '../types';
import { IconPlus, IconTrash, IconCalendar } from './Icons';

interface TimelineEditorProps {
  activities: Activity[];
  onChange: (activities: Activity[]) => void;
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({ activities, onChange }) => {
  const addActivity = () => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: "Nueva Actividad",
      description: "Descripción...",
      durationDays: 5,
      responsible: "Contratista"
    };
    onChange([...activities, newActivity]);
  };

  const removeActivity = (id: string) => {
    onChange(activities.filter(a => a.id !== id));
  };

  const updateActivity = (id: string, field: keyof Activity, value: any) => {
    onChange(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Cronograma de Actividades</h3>
        <button
          onClick={addActivity}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <IconPlus className="w-4 h-4" /> Nueva Actividad
        </button>
      </div>

      <div className="grid gap-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="bg-white border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {index + 1}
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <input
                  type="text"
                  value={activity.name}
                  onChange={(e) => updateActivity(activity.id, 'name', e.target.value)}
                  placeholder="Nombre de actividad"
                  className="w-full font-medium text-slate-900 bg-white border-none p-0 focus:ring-0 text-lg placeholder:text-slate-300"
                />
                <textarea
                  value={activity.description}
                  onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                  placeholder="Descripción detallada"
                  rows={2}
                  className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                   <label className="block text-slate-500 text-xs mb-1">Duración (Días)</label>
                   <input
                    type="number"
                    min="1"
                    value={activity.durationDays}
                    onChange={(e) => updateActivity(activity.id, 'durationDays', parseInt(e.target.value))}
                    className="w-full bg-white text-slate-900 border-slate-200 rounded"
                   />
                </div>
                <div>
                   <label className="block text-slate-500 text-xs mb-1">Responsable</label>
                   <select
                    value={activity.responsible}
                    onChange={(e) => updateActivity(activity.id, 'responsible', e.target.value)}
                    className="w-full bg-white text-slate-900 border-slate-200 rounded"
                   >
                     <option>Contratista</option>
                     <option>Entidad</option>
                     <option>Supervisor</option>
                   </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-slate-500 text-xs mb-1">Fechas (Estimadas)</label>
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <IconCalendar className="w-4 h-4" />
                        <span>Se calcularán al inicio</span>
                    </div>
                </div>
              </div>
            </div>

            <button onClick={() => removeActivity(activity.id)} className="text-slate-400 hover:text-red-500 p-2">
                <IconTrash className="w-5 h-5" />
            </button>
          </div>
        ))}

        {activities.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-400">No hay actividades en el cronograma.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TimelineEditor;
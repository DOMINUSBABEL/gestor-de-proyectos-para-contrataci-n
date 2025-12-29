import React, { useState, useEffect } from 'react';
import { ProjectStructure, ModalidadContratacion, SectionTab } from './types';
import { generateProjectStructure, refineSection } from './services/geminiService';
import RiskMatrix from './components/RiskMatrix';
import TimelineEditor from './components/TimelineEditor';
import DeliverablesEditor from './components/DeliverablesEditor';
import { 
    IconFileText, 
    IconTarget, 
    IconAlertTriangle, 
    IconDollarSign, 
    IconCalendar, 
    IconBox, 
    IconSparkles,
    IconCheck
} from './components/Icons';

const App: React.FC = () => {
  const [project, setProject] = useState<Partial<ProjectStructure> | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<SectionTab>('info');
  const [error, setError] = useState<string | null>(null);
  
  // Refinement state
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateProjectStructure(prompt);
      // Ensure IDs exist
      const enrichedProject: Partial<ProjectStructure> = {
        ...result,
        id: crypto.randomUUID(),
        activities: result.activities?.map(a => ({...a, id: crypto.randomUUID()})) || [],
        risks: result.risks?.map(r => ({...r, id: crypto.randomUUID()})) || [],
        deliverables: result.deliverables?.map(d => ({...d, id: crypto.randomUUID()})) || [],
        budget: result.budget?.map(b => ({...b, id: crypto.randomUUID()})) || [],
      };
      setProject(enrichedProject);
    } catch (err) {
      setError("Hubo un error al generar la estructura con IA. Por favor intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
      if(!project || !refinementPrompt.trim()) return;
      setIsRefining(true);
      
      try {
        let updatedProject = { ...project };
        
        switch(activeTab) {
            case 'info':
                const infoRes = await refineSection('Información Básica (titulo, descripcion, justificacion)', 
                    { title: project.title, description: project.description, justification: project.justification }, 
                    refinementPrompt);
                updatedProject = { ...updatedProject, ...infoRes };
                break;
            case 'objectives':
                 const objRes = await refineSection('Objetivos', 
                    { generalObjective: project.generalObjective, specificObjectives: project.specificObjectives }, 
                    refinementPrompt);
                updatedProject = { ...updatedProject, ...objRes };
                break;
             // Other sections handle their own arrays, but could be AI refined here too
        }
        setProject(updatedProject);
        setRefinementPrompt('');
      } catch(err) {
          console.error(err);
      } finally {
          setIsRefining(false);
      }
  };

  // UI Handlers for manual edits
  const updateField = (field: keyof ProjectStructure, value: any) => {
    if (!project) return;
    setProject({ ...project, [field]: value });
  };

  const renderContent = () => {
    if (!project) return null;

    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título del Proyecto</label>
                    <input 
                        type="text" 
                        className="w-full bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={project.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Entidad Contratante</label>
                    <input 
                        type="text" 
                        className="w-full bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={project.entityName || ''}
                        onChange={(e) => updateField('entityName', e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Modalidad de Contratación</label>
                    <select 
                        className="w-full bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={project.modalidad || ''}
                        onChange={(e) => updateField('modalidad', e.target.value)}
                    >
                        {Object.values(ModalidadContratacion).map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Objeto</label>
                    <textarea 
                        rows={4}
                        className="w-full bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={project.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Justificación y Necesidad</label>
                    <textarea 
                        rows={4}
                        className="w-full bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={project.justification || ''}
                        onChange={(e) => updateField('justification', e.target.value)}
                    />
                </div>
            </div>
          </div>
        );

      case 'objectives':
        return (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Objetivo General</h3>
                    <textarea 
                        className="w-full bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        value={project.generalObjective || ''}
                        onChange={(e) => updateField('generalObjective', e.target.value)}
                    />
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Objetivos Específicos</h3>
                    <div className="space-y-3">
                        {project.specificObjectives?.map((obj, idx) => (
                            <div key={idx} className="flex gap-2">
                                <span className="pt-2 text-slate-400 font-mono">{idx + 1}.</span>
                                <input 
                                    type="text"
                                    className="w-full bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={obj}
                                    onChange={(e) => {
                                        const newObjs = [...(project.specificObjectives || [])];
                                        newObjs[idx] = e.target.value;
                                        updateField('specificObjectives', newObjs);
                                    }}
                                />
                                <button 
                                    onClick={() => {
                                         const newObjs = project.specificObjectives?.filter((_, i) => i !== idx);
                                         updateField('specificObjectives', newObjs);
                                    }}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => updateField('specificObjectives', [...(project.specificObjectives || []), ''])}
                            className="text-sm text-blue-600 font-medium hover:underline"
                        >
                            + Agregar Objetivo
                        </button>
                    </div>
                </div>
            </div>
        );

      case 'risks':
        return <RiskMatrix risks={project.risks || []} onChange={(risks) => updateField('risks', risks)} />;
      
      case 'timeline':
        return <TimelineEditor activities={project.activities || []} onChange={(acts) => updateField('activities', acts)} />;

      case 'deliverables':
        return <DeliverablesEditor deliverables={project.deliverables || []} onChange={(dels) => updateField('deliverables', dels)} />;
        
      case 'budget':
          return (
              <div className="max-w-4xl mx-auto">
                   <div className="overflow-x-auto border rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Item</th>
                                <th className="px-4 py-3">Unidad</th>
                                <th className="px-4 py-3">Cantidad</th>
                                <th className="px-4 py-3 text-right">Valor Unitario</th>
                                <th className="px-4 py-3 text-right">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {project.budget?.map((line, idx) => (
                                <tr key={idx} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-4 py-2">{line.item}</td>
                                    <td className="px-4 py-2">{line.unit}</td>
                                    <td className="px-4 py-2">{line.quantity}</td>
                                    <td className="px-4 py-2 text-right">${line.unitPrice.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-right font-medium text-slate-900">${line.totalPrice.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-900">
                            <tr>
                                <td colSpan={4} className="px-4 py-3 text-right">TOTAL ESTIMADO</td>
                                <td className="px-4 py-3 text-right">
                                    ${project.budget?.reduce((acc, curr) => acc + curr.totalPrice, 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                   </div>
                   <p className="mt-4 text-xs text-slate-400 italic text-center">
                       Este presupuesto es preliminar y debe ser validado con un estudio de mercado real conforme a la ley.
                   </p>
              </div>
          );

      default:
        return null;
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestor de Contratación Estatal</h1>
            <p className="text-slate-500">Estructura tus proyectos de Ley 80 con Inteligencia Artificial</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Describe tu proyecto o pega el contenido de una convocatoria:
              </label>
              <textarea 
                className="w-full h-40 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 bg-white placeholder:text-slate-400"
                placeholder="Ej: Contratar el suministro de papelería para la Alcaldía de Medellín por 6 meses, incluyendo resmas, bolígrafos y carpetas..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                    <IconAlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all shadow-lg
                ${loading || !prompt.trim() 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25 hover:scale-[1.01]'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Estructurando Proyecto...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <IconSparkles className="w-5 h-5" />
                  Comenzar Estructuración
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    G
                </div>
                <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
                    {project.title || 'Nuevo Proyecto'}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                 <button onClick={() => setProject(null)} className="text-sm text-slate-500 hover:text-slate-800">
                    Nuevo
                 </button>
                 <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                    Exportar Documentos
                 </button>
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-col lg:flex-row">
        
        {/* Sidebar Navigation */}
        <nav className="w-full lg:w-64 flex-shrink-0 space-y-1">
            <button 
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'info' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                <IconFileText className="w-5 h-5" /> Información General
            </button>
             <button 
                onClick={() => setActiveTab('objectives')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'objectives' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                <IconTarget className="w-5 h-5" /> Objetivos
            </button>
             <button 
                onClick={() => setActiveTab('timeline')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'timeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                <IconCalendar className="w-5 h-5" /> Cronograma
            </button>
             <button 
                onClick={() => setActiveTab('deliverables')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'deliverables' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                <IconBox className="w-5 h-5" /> Entregables
            </button>
             <button 
                onClick={() => setActiveTab('risks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'risks' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                <IconAlertTriangle className="w-5 h-5" /> Matriz de Riesgos
            </button>
             <button 
                onClick={() => setActiveTab('budget')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'budget' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                <IconDollarSign className="w-5 h-5" /> Presupuesto
            </button>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
                <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {activeTab === 'info' && 'Estructuración Básica'}
                        {activeTab === 'objectives' && 'Objetivos del Proyecto'}
                        {activeTab === 'timeline' && 'Planificación y Cronograma'}
                        {activeTab === 'deliverables' && 'Entregables y Productos'}
                        {activeTab === 'risks' && 'Gestión de Riesgos'}
                        {activeTab === 'budget' && 'Análisis Financiero'}
                    </h2>
                    
                    {/* AI Assistant Mini-Bar */}
                    {(activeTab === 'info' || activeTab === 'objectives') && (
                         <div className="flex gap-2">
                             <input 
                                type="text"
                                placeholder="Refinar con IA..."
                                className="text-sm bg-white text-slate-900 border-slate-200 rounded-md py-1.5 px-3 w-64 focus:ring-blue-500 focus:border-blue-500"
                                value={refinementPrompt}
                                onChange={(e) => setRefinementPrompt(e.target.value)}
                             />
                             <button 
                                onClick={handleRefine}
                                disabled={isRefining || !refinementPrompt}
                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-md transition-colors"
                             >
                                 {isRefining ? <span className="animate-spin text-lg">⟳</span> : <IconSparkles className="w-4 h-4" />}
                             </button>
                         </div>
                    )}
                </div>
                
                {renderContent()}
             </div>
        </div>

      </main>
    </div>
  );
};

export default App;
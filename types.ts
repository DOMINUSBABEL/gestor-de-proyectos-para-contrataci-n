export enum ModalidadContratacion {
  LICITACION_PUBLICA = "Licitación Pública",
  SELECCION_ABREVIADA = "Selección Abreviada",
  CONCURSO_MERITOS = "Concurso de Méritos",
  CONTRATACION_DIRECTA = "Contratación Directa",
  MINIMA_CUANTIA = "Mínima Cuantía"
}

export enum RiskLevel {
  BAJO = "Bajo",
  MEDIO = "Medio",
  ALTO = "Alto",
  EXTREMO = "Extremo"
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  startDate?: string;
  endDate?: string;
  responsible: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  dueDate?: string;
  acceptanceCriteria: string;
}

export interface Risk {
  id: string;
  description: string;
  consequence: string;
  probability: number; // 1-5
  impact: number; // 1-5
  level: RiskLevel;
  treatment: string; // Mitigación, Transferencia, Aceptación, Evitación
  responsible: string;
}

export interface BudgetLine {
  id: string;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ProjectStructure {
  id: string;
  title: string;
  entityName: string;
  description: string;
  modalidad: ModalidadContratacion;
  generalObjective: string;
  specificObjectives: string[];
  justification: string; // Necesidad que se pretende satisfacer
  obligationsContractor: string[];
  obligationsEntity: string[];
  activities: Activity[];
  deliverables: Deliverable[];
  risks: Risk[]; // Matriz de Riesgos
  budget: BudgetLine[];
  requirements: string[]; // Requisitos habilitantes (jurídicos, financieros, técnicos)
  lastUpdated: string;
}

export type SectionTab = 'info' | 'objectives' | 'timeline' | 'risks' | 'budget' | 'deliverables';
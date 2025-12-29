import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProjectStructure, ModalidadContratacion, RiskLevel } from "../types";
import { KNOWLEDGE_BASE } from "./knowledgeBase";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema definitions for structured output
const projectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    entityName: { type: Type.STRING },
    description: { type: Type.STRING },
    modalidad: { type: Type.STRING, enum: Object.values(ModalidadContratacion) },
    generalObjective: { type: Type.STRING },
    specificObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
    justification: { type: Type.STRING },
    obligationsContractor: { type: Type.ARRAY, items: { type: Type.STRING } },
    obligationsEntity: { type: Type.ARRAY, items: { type: Type.STRING } },
    requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    activities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          durationDays: { type: Type.INTEGER },
          responsible: { type: Type.STRING },
        },
        required: ["name", "description", "durationDays", "responsible"]
      }
    },
    deliverables: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          acceptanceCriteria: { type: Type.STRING },
        },
        required: ["name", "description", "acceptanceCriteria"]
      }
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          consequence: { type: Type.STRING },
          probability: { type: Type.INTEGER },
          impact: { type: Type.INTEGER },
          level: { type: Type.STRING, enum: Object.values(RiskLevel) },
          treatment: { type: Type.STRING },
          responsible: { type: Type.STRING },
        },
        required: ["description", "consequence", "probability", "impact", "level", "treatment", "responsible"]
      }
    },
    budget: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          unit: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
          totalPrice: { type: Type.NUMBER },
        },
        required: ["item", "unit", "quantity", "unitPrice", "totalPrice"]
      }
    }
  },
  required: ["title", "description", "modalidad", "generalObjective", "specificObjectives", "justification", "obligationsContractor", "risks", "activities", "deliverables"]
};

export const generateProjectStructure = async (input: string): Promise<Partial<ProjectStructure>> => {
  // Using Pro model for better complex reasoning with legal context
  const modelId = "gemini-3-pro-preview";
  
  const prompt = `
    Actúa como un experto consultor en Contratación Estatal de Colombia (Ley 80 de 1993, Ley 1150 de 2007, Decreto 1082 de 2015, Ley 2069 de 2020 y normativa vigente 2025).
    
    Utiliza el siguiente CONTEXTO LEGAL (base de conocimiento) para fundamentar tus respuestas:
    ${KNOWLEDGE_BASE}
    
    A partir del siguiente texto proporcionado por un usuario (que puede ser una idea, un pliego de condiciones crudo o una convocatoria), estructura un proyecto formal.
    
    TEXTO DEL USUARIO:
    "${input}"
    
    INSTRUCCIONES:
    1. Identifica o sugiere la Modalidad de Contratación más adecuada basándote en la cuantía (si se infiere), el objeto y el régimen (Especial o Ley 80).
    2. Redacta Objetivos (General y Específicos) usando verbos en infinitivo.
    3. Desarrolla la Justificación legal y de conveniencia brevemente, citando normas si es pertinente.
    4. Estructura una Matriz de Riesgos preliminar típica para este tipo de objeto contractual (considera riesgos previsibles según las guías).
    5. Define Actividades y Entregables lógicos.
    6. Estima un presupuesto básico si hay datos, o usa valores referenciales (placeholders) si no.
    7. Define Obligaciones generales del contratista y de la entidad, incluyendo temas de seguridad social, informes, etc.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: projectSchema,
        thinkingConfig: { thinkingBudget: 2048 } // Higher thinking budget for legal analysis
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Partial<ProjectStructure>;
  } catch (error) {
    console.error("Error generating project structure:", error);
    throw error;
  }
};

export const refineSection = async (sectionName: string, currentContent: any, userInstruction: string): Promise<any> => {
   const modelId = "gemini-3-flash-preview";
   const prompt = `
     Actúa como experto en contratación pública de Colombia.
     Tengo esta sección del proyecto: "${sectionName}".
     Contenido actual (JSON): ${JSON.stringify(currentContent)}
     
     Instrucción de ajuste del usuario: "${userInstruction}"
     
     Devuelve SOLO el JSON actualizado para esta sección, manteniendo la estructura estricta.
   `;
   
    try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text;
    if(!text) return currentContent;
    return JSON.parse(text);
  } catch(e) {
    console.error(e);
    return currentContent;
  }
}

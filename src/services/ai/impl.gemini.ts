
// src/services/ai/impl.gemini.ts
'use server';
/**
 * @fileOverview Gemini (Genkit) implementation of the AI service.
 * This file acts as an orchestrator, importing and calling the specific
 * Genkit flows defined in the /src/ai/flows directory.
 */
import { generateTemplateFlow, type GenerateTemplateFlowInput, type GenerateTemplateFlowOutput } from '@/ai/flows/generate-template-flow';
import { suggestFormulaFlow, type SuggestFormulaFlowInput, type SuggestFormulaFlowOutput } from '@/ai/flows/suggest-formula-flow';

// The input/output types for the service methods are now imported directly from the flows.
export type { GenerateTemplateFlowInput as GenerateTemplateInput, GenerateTemplateFlowOutput as GenerateTemplateOutput } from '@/ai/flows/generate-template-flow';
export type { SuggestFormulaFlowInput as SuggestFormulaInput, SuggestFormulaFlowOutput as SuggestFormulaOutput } from '@/ai/flows/suggest-formula-flow';


// Exported service functions matching the AIService interface
export async function generateTemplate(input: GenerateTemplateFlowInput): Promise<GenerateTemplateFlowOutput> {
  return generateTemplateFlow(input);
}

export async function suggestFormula(input: SuggestFormulaFlowInput): Promise<SuggestFormulaFlowOutput> {
  return suggestFormulaFlow(input);
}

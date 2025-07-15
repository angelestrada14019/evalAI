// src/services/ai/impl.gemini.ts
'use server';
/**
 * @fileOverview Gemini (Genkit) implementation of the AI service.
 */

import { ai as genkitAi } from '@/ai/genkit';
import { z } from 'genkit';

// Input and Output Schemas for Template Generation
const GenerateTemplateInputSchema = z.object({
  description: z.string().describe('A detailed description of the evaluation form template to generate.'),
});
export type GenerateTemplateInput = z.infer<typeof GenerateTemplateInputSchema>;

const GenerateTemplateOutputSchema = z.object({
  template: z.string().describe('The generated evaluation form template in JSON format.'),
});
export type GenerateTemplateOutput = z.infer<typeof GenerateTemplateOutputSchema>;


// Input and Output Schemas for Formula Suggestion
const SuggestFormulaInputSchema = z.object({
  formContent: z
    .string()
    .describe('The content of the evaluation form, including questions and answer types.'),
});
export type SuggestFormulaInput = z.infer<typeof SuggestFormulaInputSchema>;

const SuggestFormulaOutputSchema = z.object({
  suggestedFormula: z
    .string()
    .describe('The AI-suggested formula for calculating scores.'),
  reasoning: z.string().describe('The AI reasoning behind the suggested formula.'),
});
export type SuggestFormulaOutput = z.infer<typeof SuggestFormulaOutputSchema>;


// Genkit Prompts and Flows
const generateTemplatePrompt = genkitAi.definePrompt({
  name: 'generateTemplatePrompt',
  input: { schema: GenerateTemplateInputSchema },
  output: { schema: GenerateTemplateOutputSchema },
  prompt: `You are an AI assistant specialized in generating evaluation form templates based on user descriptions.
  Your goal is to create a valid JSON template that can be used in a form builder application.
  The template should be comprehensive and include various form elements like text fields, multiple choice questions, sliders, etc., as appropriate for the described evaluation.
  Consider conditional logic and scoring mechanisms where applicable.

  Description: {{{description}}}

  Template:`,
});

const suggestFormulaPrompt = genkitAi.definePrompt({
  name: 'suggestFormulaPrompt',
  input: { schema: SuggestFormulaInputSchema },
  output: { schema: SuggestFormulaOutputSchema },
  prompt: `You are an AI assistant specialized in suggesting formulas for calculating scores in evaluation forms.
  Based on the following form content, suggest a formula for calculating the overall score. Also, explain your reasoning behind the formula.
  Form Content: {{{formContent}}}
  Please provide the suggested formula and your reasoning in the output.`,
});

const generateTemplateFlow = genkitAi.defineFlow(
  {
    name: 'generateTemplateFlow',
    inputSchema: GenerateTemplateInputSchema,
    outputSchema: GenerateTemplateOutputSchema,
  },
  async input => {
    const { output } = await generateTemplatePrompt(input);
    return output!;
  }
);

const suggestFormulaFlow = genkitAi.defineFlow(
  {
    name: 'suggestFormulaFlow',
    inputSchema: SuggestFormulaInputSchema,
    outputSchema: SuggestFormulaOutputSchema,
  },
  async input => {
    const { output } = await suggestFormulaPrompt(input);
    return output!;
  }
);


// Exported service functions matching the AIService interface
export async function generateTemplate(input: GenerateTemplateInput): Promise<GenerateTemplateOutput> {
  return generateTemplateFlow(input);
}

export async function suggestFormula(input: SuggestFormulaInput): Promise<SuggestFormulaOutput> {
  return suggestFormulaFlow(input);
}

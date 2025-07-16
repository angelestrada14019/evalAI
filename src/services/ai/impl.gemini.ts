
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

const FormItemSchema = z.object({
    type: z.string().describe('e.g., "Multiple Choice", "Text Input", "Slider", "Rating Scale", "Matrix Table", "Section Header"'),
    label: z.string().describe('The question text.'),
    required: z.boolean().describe('A boolean value.'),
    variableId: z.string().describe('A unique, descriptive, snake_case ID for the question (e.g., "coding_skills"). Section Headers do not need a variableId.'),
    options: z.array(z.object({
        label: z.string(),
        value: z.number()
    })).optional().describe('For "Multiple Choice"'),
    sliderConfig: z.object({
        min: z.number(),
        max: z.number(),
        step: z.number()
    }).optional().describe('For "Slider"'),
    ratingConfig: z.object({
        max: z.number()
    }).optional().describe('For "Rating Scale"'),
    matrixConfig: z.object({
        rows: z.array(z.string()),
        columns: z.array(z.object({
            label: z.string(),
            value: z.number()
        }))
    }).optional().describe('For "Matrix Table"'),
});

const GenerateTemplateOutputSchema = z.object({
  title: z.string().describe('The title of the evaluation form.'),
  description: z.string().describe('A brief description of the evaluation form.'),
  items: z.array(FormItemSchema).describe('An array of question objects for the form.'),
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
  Your goal is to create a valid JSON object that matches the requested schema.
  The object must have a "title", a "description", and an "items" array.
  Each item in the array is a question and must have:
  - "type": (e.g., "Multiple Choice", "Text Input", "Slider", "Rating Scale", "Matrix Table", "Section Header").
  - "label": The question text.
  - "required": A boolean value.
  - "variableId": A unique, descriptive, snake_case ID for the question (e.g., "coding_skills"). Section Headers do not need a variableId.

  For specific types, you MUST include these extra properties:
  - "Multiple Choice": Include "options", an array of objects, each with "label" (string) and "value" (number).
  - "Slider": Include "sliderConfig" with "min", "max", and "step" numbers.
  - "Rating Scale": Include "ratingConfig" with a "max" number.
  - "Matrix Table": Include "matrixConfig" with "rows" (array of strings) and "columns" (array of objects with "label" and "value").

  Generate a comprehensive form based on this description. Do NOT include fields for user's name or email, those are added automatically.

  Description: {{{description}}}
  
  Generate the JSON object now.`,
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

    

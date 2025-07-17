
'use server';
/**
 * @fileOverview A Genkit flow for generating evaluation form templates.
 *
 * - generateTemplateFlow: A function that generates a form template based on a description.
 * - GenerateTemplateFlowInput: The input type for the flow.
 * - GenerateTemplateFlowOutput: The return type for the flow.
 */

import { ai as genkitAi } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas for Form Items
const OptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
});

const SliderConfigSchema = z.object({
  min: z.number(),
  max: z.number(),
  step: z.number(),
});

const RatingConfigSchema = z.object({
  max: z.number(),
});

const MatrixConfigSchema = z.object({
  rows: z.array(z.string()),
  columns: z.array(OptionSchema),
});

const FileUploadConfigSchema = z.object({
    allowedTypes: z.array(z.string()),
    maxSizeMB: z.number(),
});

const FormItemSchema = z.object({
  id: z.string(),
  variableId: z.string(),
  type: z.string(),
  label: z.string(),
  required: z.boolean(),
  readOnly: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
  options: z.array(OptionSchema).optional(),
  sliderConfig: SliderConfigSchema.optional(),
  ratingConfig: RatingConfigSchema.optional(),
  matrixConfig: MatrixConfigSchema.optional(),
  fileUploadConfig: FileUploadConfigSchema.optional(),
});


// Input and Output Schemas for the Flow
const GenerateTemplateFlowInputSchema = z.object({
  description: z.string().describe('A detailed description of the evaluation form template to generate.'),
});
export type GenerateTemplateFlowInput = z.infer<typeof GenerateTemplateFlowInputSchema>;

const GenerateTemplateFlowOutputSchema = z.object({
  title: z.string().describe('The title of the evaluation form.'),
  description: z.string().describe('A brief description of the evaluation form.'),
  items: z.array(FormItemSchema).describe('An array of question objects for the form.'),
});
export type GenerateTemplateFlowOutput = z.infer<typeof GenerateTemplateFlowOutputSchema>;


// Genkit Prompt Definition
const generateTemplatePrompt = genkitAi.definePrompt({
  name: 'generateTemplatePrompt',
  input: { schema: GenerateTemplateFlowInputSchema },
  output: { schema: GenerateTemplateFlowOutputSchema },
  model: 'googleai/gemini-1.5-flash',
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


// Genkit Flow Definition
const flow = genkitAi.defineFlow(
  {
    name: 'generateTemplateFlow',
    inputSchema: GenerateTemplateFlowInputSchema,
    outputSchema: GenerateTemplateFlowOutputSchema,
  },
  async input => {
    console.log('[Flow] Executing generateTemplateFlow...');
    try {
      const { output } = await generateTemplatePrompt(input);
      if (!output) {
        console.error('[Flow] Genkit prompt returned a null or undefined output.');
        throw new Error('Genkit prompt returned null output.');
      }
      console.log('[Flow] Successfully received output from prompt.');
      return output;
    } catch (e) {
      console.error('[Flow] Error during prompt execution:', e);
      throw e; // Re-throw the original error to be caught by the action
    }
  }
);

// Exported wrapper function to be used by the AI service.
export async function generateTemplateFlow(input: GenerateTemplateFlowInput): Promise<GenerateTemplateFlowOutput> {
  return flow(input);
}

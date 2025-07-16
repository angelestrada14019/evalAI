
// src/services/ai/impl.gemini.ts
'use server';
/**
 * @fileOverview Gemini (Genkit) implementation of the AI service.
 */

import { ai as genkitAi } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas for Form Items, used in both generation and formula suggestion
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
  imageUrl: z.string().url().nullable().optional(),
  options: z.array(OptionSchema).optional(),
  sliderConfig: SliderConfigSchema.optional(),
  ratingConfig: RatingConfigSchema.optional(),
  matrixConfig: MatrixConfigSchema.optional(),
  fileUploadConfig: FileUploadConfigSchema.optional(),
});

// Input and Output Schemas for Template Generation
const GenerateTemplateInputSchema = z.object({
  description: z.string().describe('A detailed description of the evaluation form template to generate.'),
});
export type GenerateTemplateInput = z.infer<typeof GenerateTemplateInputSchema>;

const GenerateTemplateOutputSchema = z.object({
  title: z.string().describe('The title of the evaluation form.'),
  description: z.string().describe('A brief description of the evaluation form.'),
  items: z.array(FormItemSchema).describe('An array of question objects for the form.'),
});
export type GenerateTemplateOutput = z.infer<typeof GenerateTemplateOutputSchema>;


// Input and Output Schemas for Formula Suggestion
const SuggestFormulaInputSchema = z.object({
  template: z.object({
      title: z.string(),
      description: z.string(),
      items: z.array(FormItemSchema).describe('The array of question items from the form. The AI should focus on items that have a `variableId` as these are the ones available for scoring.'),
  }).describe('The entire form template object, containing title, description, and the list of form items.'),
});
export type SuggestFormulaInput = z.infer<typeof SuggestFormulaInputSchema>;

const SuggestFormulaOutputSchema = z.object({
  suggestedFormula: z
    .string()
    .describe('The AI-suggested formula for calculating scores, using the `variableId`s from the form items.'),
  reasoning: z.string().describe('The AI reasoning behind the suggested formula, explaining weights and choices.'),
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
  prompt: `You are an AI assistant specialized in suggesting scoring formulas for evaluation forms.
Based on the provided form template, suggest a weighted formula for calculating an overall score.
Explain your reasoning, including why you chose certain weights for each scorable item.
The formula should only use the 'variableId' of the questions. Do not include items that are not scorable (like Text Inputs or Section Headers).

Form Title: {{template.title}}
Form Description: {{template.description}}

Scorable Form Items:
{{#each template.items}}
  {{#if this.variableId}}
- Question: "{{this.label}}" (ID: {{this.variableId}})
  Type: {{this.type}}
    {{#if this.options}}
      Options: {{#each this.options}}{{this.label}} ({{this.value}}), {{/each}}
    {{/if}}
    {{#if this.ratingConfig}}
      Scale: 1 to {{this.ratingConfig.max}}
    {{/if}}
    {{#if this.sliderConfig}}
      Range: {{this.sliderConfig.min}} to {{this.sliderConfig.max}}
    {{/if}}
     {{#if this.matrixConfig}}
      Matrix with rows: {{#each this.rows}}{{this}}, {{/each}}
    {{/if}}
  {{/if}}
{{/each}}

Please provide the suggested formula and your reasoning.`,
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


'use server';
/**
 * @fileOverview A Genkit flow for suggesting a scoring formula.
 *
 * - suggestFormulaFlow: A function that suggests a formula based on a form template.
 * - SuggestFormulaFlowInput: The input type for the flow.
 * - SuggestFormulaFlowOutput: The return type for the flow.
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
  imageUrl: z.string().url().nullable().optional(),
  options: z.array(OptionSchema).optional(),
  sliderConfig: SliderConfigSchema.optional(),
  ratingConfig: RatingConfigSchema.optional(),
  matrixConfig: MatrixConfigSchema.optional(),
  fileUploadConfig: FileUploadConfigSchema.optional(),
});

// Input and Output Schemas for the Flow
const SuggestFormulaFlowInputSchema = z.object({
  template: z.object({
      title: z.string(),
      description: z.string(),
      items: z.array(FormItemSchema).describe('The array of question items from the form. The AI should focus on items that have a `variableId` as these are the ones available for scoring.'),
  }).describe('The entire form template object, containing title, description, and the list of form items.'),
});
export type SuggestFormulaFlowInput = z.infer<typeof SuggestFormulaFlowInputSchema>;

const SuggestFormulaFlowOutputSchema = z.object({
  suggestedFormula: z
    .string()
    .describe('The AI-suggested formula for calculating scores, using the `variableId`s from the form items.'),
  reasoning: z.string().describe('The AI reasoning behind the suggested formula, explaining weights and choices.'),
});
export type SuggestFormulaFlowOutput = z.infer<typeof SuggestFormulaFlowOutputSchema>;


// Genkit Prompt Definition
const suggestFormulaPrompt = genkitAi.definePrompt({
  name: 'suggestFormulaPrompt',
  input: { schema: SuggestFormulaFlowInputSchema },
  output: { schema: SuggestFormulaFlowOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an AI assistant specialized in suggesting scoring formulas for evaluation forms.
Based on the provided form template, suggest a weighted formula for calculating an overall score.
Explain your reasoning, including why you chose certain weights for each scorable item.
The formula should only use the 'variableId' of the questions. Do not include items that are not scorable (like Text Inputs or Section Headers).

Form Title: {{template.title}}
Form Description: {{template.description}}

Scorable Form Items:
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

// Genkit Flow Definition
const flow = genkitAi.defineFlow(
  {
    name: 'suggestFormulaFlow',
    inputSchema: SuggestFormulaFlowInputSchema,
    outputSchema: SuggestFormulaFlowOutputSchema,
  },
  async input => {
    const { output } = await suggestFormulaPrompt(input);
    return output!;
  }
);

// Exported wrapper function to be used by the AI service.
export async function suggestFormulaFlow(input: SuggestFormulaFlowInput): Promise<SuggestFormulaFlowOutput> {
  return flow(input);
}

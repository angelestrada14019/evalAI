// src/ai/flows/generate-template.ts
'use server';
/**
 * @fileOverview AI-powered evaluation template generator.
 *
 * @fileOverview This file defines a Genkit flow for generating evaluation form templates from a text description.
 * It includes the input and output schemas, the main function to trigger the flow, and the flow definition itself.
 *
 * @exports generateTemplate - A function that generates an evaluation form template from a text description.
 * @exports GenerateTemplateInput - The input type for the generateTemplate function.
 * @exports GenerateTemplateOutput - The return type for the generateTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTemplateInputSchema = z.object({
  description: z.string().describe('A detailed description of the evaluation form template to generate.'),
});

export type GenerateTemplateInput = z.infer<typeof GenerateTemplateInputSchema>;

const GenerateTemplateOutputSchema = z.object({
  template: z.string().describe('The generated evaluation form template in JSON format.'),
});

export type GenerateTemplateOutput = z.infer<typeof GenerateTemplateOutputSchema>;

export async function generateTemplate(input: GenerateTemplateInput): Promise<GenerateTemplateOutput> {
  return generateTemplateFlow(input);
}

const generateTemplatePrompt = ai.definePrompt({
  name: 'generateTemplatePrompt',
  input: {schema: GenerateTemplateInputSchema},
  output: {schema: GenerateTemplateOutputSchema},
  prompt: `You are an AI assistant specialized in generating evaluation form templates based on user descriptions.
  Your goal is to create a valid JSON template that can be used in a form builder application.
  The template should be comprehensive and include various form elements like text fields, multiple choice questions, sliders, etc., as appropriate for the described evaluation.
  Consider conditional logic and scoring mechanisms where applicable.

  Description: {{{description}}}

  Template:`, // Prompt content here
});

const generateTemplateFlow = ai.defineFlow(
  {
    name: 'generateTemplateFlow',
    inputSchema: GenerateTemplateInputSchema,
    outputSchema: GenerateTemplateOutputSchema,
  },
  async input => {
    const {output} = await generateTemplatePrompt(input);
    return output!;
  }
);

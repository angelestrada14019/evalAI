'use server';

/**
 * @fileOverview An AI agent that suggests formulas for calculating scores based on the questions and answer types in an evaluation form.
 *
 * - suggestFormula - A function that handles the formula suggestion process.
 * - SuggestFormulaInput - The input type for the suggestFormula function.
 * - SuggestFormulaOutput - The return type for the suggestFormula function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFormulaInputSchema = z.object({
  formContent: z
    .string()
    .describe(
      'The content of the evaluation form, including questions and answer types.'
    ),
});
export type SuggestFormulaInput = z.infer<typeof SuggestFormulaInputSchema>;

const SuggestFormulaOutputSchema = z.object({
  suggestedFormula: z
    .string()
    .describe('The AI-suggested formula for calculating scores.'),
  reasoning: z.string().describe('The AI reasoning behind the suggested formula.'),
});
export type SuggestFormulaOutput = z.infer<typeof SuggestFormulaOutputSchema>;

export async function suggestFormula(input: SuggestFormulaInput): Promise<SuggestFormulaOutput> {
  return suggestFormulaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFormulaPrompt',
  input: {schema: SuggestFormulaInputSchema},
  output: {schema: SuggestFormulaOutputSchema},
  prompt: `You are an AI assistant specialized in suggesting formulas for calculating scores in evaluation forms.

  Based on the following form content, suggest a formula for calculating the overall score. Also, explain your reasoning behind the formula.

  Form Content: {{{formContent}}}

  Please provide the suggested formula and your reasoning in the output.
  `,
});

const suggestFormulaFlow = ai.defineFlow(
  {
    name: 'suggestFormulaFlow',
    inputSchema: SuggestFormulaInputSchema,
    outputSchema: SuggestFormulaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

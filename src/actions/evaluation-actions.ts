'use server'

import { generateTemplate } from '@/ai/flows/generate-template'
import { suggestFormula } from '@/ai/flows/suggest-formula'

export async function generateEvaluationTemplate(description: string) {
  try {
    const result = await generateTemplate({ description })
    return result
  } catch (error) {
    console.error('Error generating template:', error)
    throw new Error('Failed to generate template')
  }
}

export async function suggestScoreFormula(formContent: string) {
  try {
    const result = await suggestFormula({ formContent })
    return result
  } catch (error) {
    console.error('Error suggesting formula:', error)
    throw new Error('Failed to suggest formula')
  }
}

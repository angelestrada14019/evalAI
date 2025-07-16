'use server'

import { ai } from '@/services/ai/ai'
import type { FormTemplate } from '@/components/evaluations/builder/types'

export async function generateEvaluationTemplate(description: string) {
  try {
    const result = await ai().generateTemplate({ description })
    return result
  } catch (error) {
    console.error('Error generating template:', error)
    throw new Error('Failed to generate template')
  }
}

export async function suggestScoreFormula(template: FormTemplate) {
  try {
    const result = await ai().suggestFormula({ template })
    return result
  } catch (error) {
    console.error('Error suggesting formula:', error)
    throw new Error('Failed to suggest formula')
  }
}

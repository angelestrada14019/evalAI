// src/services/ai/ai.ts
/**
 * @fileOverview This file defines the abstract interface for the AI service.
 * It uses the system configuration to dynamically load and export the
 * implementation specified in `systemConfig.ai.provider`.
 */
import { systemConfig } from '@/config/system';
import type { GenerateTemplateInput, GenerateTemplateOutput } from './impl.gemini';
import type { SuggestFormulaInput, SuggestFormulaOutput } from './impl.gemini';

export interface AIService {
  generateTemplate(input: GenerateTemplateInput): Promise<GenerateTemplateOutput>;
  suggestFormula(input: SuggestFormulaInput): Promise<SuggestFormulaOutput>;
}

/**
 * Dynamically loads and returns the configured AI service implementation.
 * @returns {AIService} The AI service instance.
 */
export function ai(): AIService {
  const provider = systemConfig.ai.provider;

  switch (provider) {
    case 'gemini':
      // Dynamically import the Gemini implementation
      const geminiService = require('./impl.gemini');
      return geminiService;
    case 'n8n':
      // Placeholder for n8n implementation
      throw new Error('n8n AI provider not yet implemented.');
    case 'custom':
      // Placeholder for custom implementation
      throw new Error('Custom AI provider not yet implemented.');
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

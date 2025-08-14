// This file represents the centralized configuration for provider selection.
// In a real application, this might be powered by environment variables
// and more complex logic to dynamically load the correct provider modules.

export const systemConfig = {
  auth: {
    /**
     * The active authentication provider.
     * @type {'mock' | 'supabase' | 'keycloak' | 'b2c'}
     */
    provider: 'supabase',
  },
  ai: {
    /**
     * The active AI provider for features like template generation.
     * @type {'gemini' | 'n8n' | 'custom'}
     */
    provider: 'gemini',
  },
  automation: {
    /**
     * The active automation and workflow provider.
     * @type {'n8n' | 'custom'}
     */
    provider: 'n8n',
  },
  backend: {
    /**
     * The active data backend provider.
     * @type {'mock' | 'supabase' | 'rest'}
     */
    provider: 'supabase',
  }
};

export type SystemConfig = typeof systemConfig;

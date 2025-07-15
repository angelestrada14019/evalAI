# **App Name**: EvalAI

## Core Features:

- Multi-Tenant Architecture: Full support for multi-tenant mode, including strict data isolation at the session and database level, branding per tenant, and optional URL subdomain/routing segregation.
- Authentication Abstraction Layer: Pluggable auth provider integration via an abstraction layer supporting Supabase Auth, Keycloak, Azure B2C, Auth0, or custom OAuth 2.0 identity providers. Configuration-driven switch.
- Form Builder: Drag-and-drop builder with conditional logic, rich media support, and advanced configurable item types including multiple choice, sliders, scales, matrix tables, image options, and sorting inputs.
- Evaluation Logic and Score Engine: Dynamic formula engine supporting custom user-defined logic for score calculation, conditional thresholds (e.g., beginner/expert), and formula chaining.
- AI Formula Suggestions: AI-assisted formula generation using generative LLMs (e.g., Gemini Toolkit or via n8n). Allows fallback or provider switch via config. The LLM tool determines when and how to apply logic from the user’s form content.
- AI Template Generation: Ability to generate base evaluation templates (form structures) via AI, with seamless provider swap between client-side Gemini Toolkit or backend-driven n8n workflows.
- Report Generation: PDF report templating engine supporting dynamic insertion of custom variables (e.g., name, score, evaluation date). Both per-user and global reports with aggregated analytics, visualizations, and trends.
- Global Report Dashboard: Tenant-specific dashboards showing evaluation trends, averages, response distributions, and exportable metrics.
- Automated Reporting and Workflows: Use of n8n (or other workflow orchestrator) for automated report generation, scheduling, email delivery, and third-party API triggers. Logic encapsulated and interchangeable with backend REST microservices.
- Email Automation: Event-driven and conditional email flows integrated with customizable templates and attachments (e.g., PDF reports).
- Provider Abstraction System: All core services (auth, backend, AI, automation) abstracted via interface modules. The active provider is selected via a centralized config file (`systemProvider.ts`), enabling plug-and-play substitution.
- Fine-Grained Permissions and Roles: Role-based access control (RBAC) system with tenant-aware roles (Global Admin, Tenant Admin, Editor, Reviewer, Participant). Permissions control access to views, actions, and API routes.
- Multi-Language (i18n) Support: UI and forms should support multiple languages with dynamic loading.

## Style Guidelines:

- HSL(210, 65%, 50%) → `#3399FF` Represents trust, professionalism, and clarity in data-driven contexts.
- HSL(210, 20%, 95%) → `#F0F8FF` A soft desaturated blue that enhances content readability and provides a neutral canvas.
- HSL(330, 70%, 55%) → `#FF66B2` A complementary orange/pink tone to draw attention to key actions and interactive elements.
- Use 'Inter' as the default typeface — a modern, neutral sans-serif that maintains clarity and professionalism across both display and body content.
- Use a consistent, minimal icon set to represent question types, user actions, and evaluation tools. Icons should be easily distinguishable and accessible.
- Clean, card-based and responsive UI structure, built on a grid system to ensure hierarchy and flow. Layout should be modular and adapt to screen sizes with minimal effort.
- Subtle animations for user guidance (e.g., when adding, editing, or navigating form elements). Use fade-ins, slide-ins, and scale transitions to enhance flow without being distracting.
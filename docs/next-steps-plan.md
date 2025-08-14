# 📋 Plan de Trabajo - Próximos Pasos

## 🎯 Estado Actual del Proyecto

### ✅ **Completado:**
- ✅ Sistema Multi-Tenant completo
- ✅ GraphQL API implementada
- ✅ Gestión de contactos y grupos
- ✅ Constructor de evaluaciones drag-and-drop
- ✅ Constructor avanzado de plantillas de reportes
- ✅ Sistema de permisos y roles
- ✅ IA generativa integrada (Gemini)
- ✅ Distribución de evaluaciones
- ✅ Arquitectura desacoplada
- ✅ Internacionalización básica (ES/EN)

## 🚧 **Tareas Pendientes Prioritarias**

### 1. **🌐 Completar Internacionalización**
**Prioridad: ALTA**

**Problemas identificados:**
- Textos hardcodeados en placeholders
- Mensajes de error sin internacionalizar
- Elementos del constructor de plantillas sin traducir
- Formularios con texto fijo

**Archivos que necesitan actualización:**
- `src/components/reports/template-builder/report-template-builder.tsx`
- `src/components/reports/template-builder/advanced-report-builder.tsx`
- `src/app/[locale]/(main)/contacts/page.tsx`
- `src/components/evaluations/distribution/evaluation-distribution.tsx`
- `src/components/evaluations/builder/form-builder-content.tsx`
- `src/components/auth/signup-form.tsx`

**Textos hardcodeados encontrados:**
```
- "Enter template name..."
- "Enter formula..."
- "Enter text content..."
- "Select variable..."
- "Select formula..."
- "John", "Doe", "Marketing Team"
- "Add contacts..."
- "Evaluation: Your feedback is needed"
- "Enter your email message..."
- "Account created for..."
- "You are now logged in."
- "Failed to save evaluation"
- "Save Failed"
- "No question selected"
```

### 2. **🗄️ Integración con Supabase**
**Prioridad: ALTA**

**Tareas:**
- Configurar proyecto Supabase
- Crear esquemas de base de datos
- Implementar `impl.supabase.ts` para backend
- Implementar `impl.supabase.ts` para auth
- Migrar datos mock a Supabase
- Configurar Row Level Security (RLS)
- Implementar políticas multi-tenant

**Esquemas necesarios:**
```sql
-- Tenants
-- Users
-- Evaluations
-- Questions
-- Responses
-- Contacts
-- Groups
-- Reports
-- Templates
-- Permissions
```

### 3. **🔧 Mejoras Técnicas**
**Prioridad: MEDIA**

- Implementar validación de formularios con Zod
- Agregar tests unitarios
- Optimizar rendimiento de GraphQL
- Implementar cache con Apollo Client
- Agregar logging estructurado
- Configurar monitoreo de errores

### 4. **📱 Mejoras de UX/UI**
**Prioridad: MEDIA**

- Mejorar responsive design
- Agregar loading states
- Implementar notificaciones toast
- Mejorar accesibilidad (a11y)
- Agregar dark mode
- Optimizar para móviles

## 🎯 **Plan de Implementación Sugerido**

### **Fase 1: Internacionalización (1-2 días)**
1. Agregar todas las claves faltantes a `en.json` y `es.json`
2. Reemplazar textos hardcodeados con `useTranslations`
3. Verificar que toda la UI esté traducida
4. Probar cambio de idioma en toda la aplicación

### **Fase 2: Supabase Backend (3-4 días)**
1. Configurar proyecto Supabase
2. Crear esquemas de base de datos
3. Implementar servicios Supabase
4. Migrar de mock data a Supabase
5. Configurar autenticación Supabase
6. Implementar RLS y políticas multi-tenant

### **Fase 3: Testing y Optimización (2-3 días)**
1. Agregar tests unitarios críticos
2. Optimizar rendimiento
3. Mejorar manejo de errores
4. Documentar APIs

### **Fase 4: Deployment (1-2 días)**
1. Configurar CI/CD
2. Deploy a producción
3. Configurar dominio y SSL
4. Monitoreo y logging

## 📝 **Claves de Internacionalización Faltantes**

### **TemplateBuilder:**
```json
{
  "TemplateBuilder": {
    "enterTemplateName": "Enter template name...",
    "enterFormula": "Enter formula...",
    "enterTextContent": "Enter text content...",
    "selectVariable": "Select variable...",
    "selectFormula": "Select formula...",
    "displayFormat": "Display format (e.g., 'Score: {{variable}}')",
    "displayFormatFormula": "Display format (e.g., 'Result: {{formula}}')",
    "addWidgets": "Add widgets",
    "basicElements": "Basic Elements",
    "dataElements": "Data Elements",
    "coverPage": "Cover Page",
    "grid": "Grid",
    "yourLogo": "YourLogo"
  }
}
```

### **ContactsPage:**
```json
{
  "ContactsPage": {
    "firstNamePlaceholder": "John",
    "lastNamePlaceholder": "Doe",
    "selectGroup": "Select a group (optional)",
    "groupNamePlaceholder": "Marketing Team",
    "groupDescriptionPlaceholder": "Description of this group...",
    "searchContacts": "Search contacts...",
    "addContact": "Add Contact",
    "createGroup": "Create Group",
    "firstName": "First Name",
    "lastName": "Last Name",
    "email": "Email",
    "group": "Group",
    "groupName": "Group Name",
    "description": "Description"
  }
}
```

### **EvaluationDistribution:**
```json
{
  "EvaluationDistribution": {
    "addContacts": "Add contacts...",
    "defaultSubject": "Evaluation: Your feedback is needed",
    "emailMessagePlaceholder": "Enter your email message...",
    "emailSubject": "Email Subject",
    "emailMessage": "Email Message",
    "sendEvaluation": "Send Evaluation",
    "publicLink": "Public Link",
    "shareLink": "Share this link"
  }
}
```

## 🚀 **Recomendación Inmediata**

**Empezar con la Fase 1 (Internacionalización)** ya que:
1. Es rápido de implementar
2. Mejora inmediatamente la experiencia del usuario
3. Es prerequisito para un producto profesional
4. No requiere configuraciones externas

Después proceder con **Fase 2 (Supabase)** para tener un backend robusto y escalable.

¿Te parece bien este plan? ¿Quieres que empecemos con la internacionalización o prefieres ir directo a Supabase?

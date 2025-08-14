# Implementación GraphQL - EvalAI

## Estado Actual

### ✅ Completado

#### 1. Servidor GraphQL Yoga Simple
- **Archivo**: `src/graphql/yoga-server.ts`
- **Descripción**: Servidor GraphQL simple usando GraphQL Yoga que funciona con el sistema de backend abstracto
- **Características**:
  - Esquema GraphQL básico con tipos: Tenant, User, Contact, ContactGroup, Evaluation
  - Resolvers que usan la abstracción `backend()` (compatible con mock data y futuras implementaciones)
  - Context automático para multi-tenant (extrae tenantId del hostname)
  - Queries: `me`, `contacts`, `contactGroups`, `evaluations`, `currentTenant`
  - Mutations: `createContact`, `createContactGroup`, `createEvaluation`

#### 2. Integración con Next.js
- **Archivo**: `src/app/api/graphql/route.ts`
- **Descripción**: Ruta API de Next.js que expone el servidor GraphQL
- **Endpoint**: `/api/graphql`
- **Funcionalidad**: Maneja tanto GET como POST requests

#### 3. Tipos GraphQL Estructurados
- **Directorio**: `src/graphql/types/`
- **Archivos**:
  - `scalars.ts` - Tipos escalares personalizados
  - `tenant.ts` - Tipos relacionados con tenants
  - `user.ts` - Tipos de usuario
  - `contact.ts` - Tipos de contactos y grupos
  - `evaluation.ts` - Tipos de evaluaciones
  - `reports.ts` - Tipos de reportes
  - `dashboard.ts` - Tipos del dashboard
  - `generated.ts` - Tipos generados automáticamente
  - `index.ts` - Exportaciones centralizadas

#### 4. Resolvers Modulares
- **Directorio**: `src/graphql/resolvers/`
- **Archivos**:
  - `tenant.ts` - Resolvers para operaciones de tenant
  - `user.ts` - Resolvers para usuarios
  - `contact.ts` - Resolvers para contactos y grupos
  - `evaluation.ts` - Resolvers para evaluaciones
  - `reports.ts` - Resolvers para reportes
  - `dashboard.ts` - Resolvers para dashboard
  - `index.ts` - Combinación de todos los resolvers

#### 5. Esquemas GraphQL
- **Directorio**: `src/graphql/schemas/`
- **Archivos**:
  - `base.graphql` - Esquema base con tipos fundamentales
  - `operations.graphql` - Queries y mutations

#### 6. Cliente Apollo
- **Archivos**:
  - `src/lib/graphql-client.ts` - Cliente Apollo configurado
  - `src/context/apollo-provider.tsx` - Provider de Apollo para React

### 🔄 En Progreso

#### 1. Testing del Servidor GraphQL
- **Estado**: El servidor está funcionando y se puede acceder a GraphQL Playground
- **Pendiente**: Resolver problemas menores con la interfaz de testing

#### 2. Integración con Frontend
- **Estado**: Cliente Apollo configurado pero no integrado en componentes
- **Pendiente**: Reemplazar llamadas REST con queries GraphQL en componentes

### 📋 Pendiente

#### 1. Implementación Completa de Resolvers
- Completar todos los resolvers para todas las operaciones CRUD
- Implementar paginación en queries que retornan listas
- Agregar filtros y ordenamiento

#### 2. Subscriptions (Tiempo Real)
- Implementar subscriptions para actualizaciones en tiempo real
- Notificaciones de nuevas respuestas a evaluaciones
- Updates de estado de evaluaciones

#### 3. Autenticación y Autorización GraphQL
- Middleware de autenticación para GraphQL
- Verificación de permisos en resolvers
- Context de usuario autenticado

#### 4. Optimizaciones
- DataLoader para evitar N+1 queries
- Caching de queries frecuentes
- Rate limiting

#### 5. Validación de Input
- Validación de inputs en mutations
- Sanitización de datos
- Manejo de errores mejorado

## Arquitectura

### Flujo de Datos
```
Frontend (React) 
  ↓ (Apollo Client)
GraphQL API (/api/graphql)
  ↓ (Yoga Server)
Resolvers
  ↓ (Backend Abstraction)
Mock Data / Supabase / REST API
```

### Ventajas de la Implementación Actual

1. **Desacoplamiento**: El servidor GraphQL usa la abstracción de backend, por lo que funciona con mock data y será compatible con Supabase
2. **Multi-tenant**: Context automático que extrae el tenantId del hostname
3. **Modularidad**: Tipos y resolvers organizados en módulos separados
4. **Escalabilidad**: Estructura preparada para agregar más funcionalidades
5. **Type Safety**: Tipos TypeScript generados automáticamente

### Próximos Pasos Recomendados

1. **Probar el servidor GraphQL** con queries simples usando herramientas como Postman o curl
2. **Integrar Apollo Client** en algunos componentes del frontend como prueba de concepto
3. **Completar los resolvers** faltantes para operaciones CRUD completas
4. **Implementar autenticación** en el context de GraphQL
5. **Agregar subscriptions** para funcionalidad en tiempo real

## Comandos Útiles

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Acceder a GraphQL Playground
# http://localhost:9002/api/graphql

# Ejemplo de query simple
query {
  me {
    id
    email
  }
  contacts {
    id
    email
    firstName
    lastName
  }
}
```

## Notas Técnicas

- El servidor GraphQL Yoga está configurado para funcionar tanto con mock data como con implementaciones reales
- El context incluye automáticamente `tenantId` y `userId` para todas las operaciones
- Los resolvers manejan errores y retornan arrays vacíos en caso de fallo
- La estructura está preparada para migrar fácilmente a Supabase cuando sea necesario

# Configuración de Supabase para EvalAI

## ¿Qué es Supabase?

Supabase es una plataforma de base de datos que nos permite:
- Almacenar datos de forma segura
- Manejar usuarios y autenticación
- Crear APIs automáticamente
- Separar datos por tenant (multi-tenant)

## Archivos Creados

### 1. Base de Datos (SQL)

**`supabase/migrations/001_initial_schema.sql`**
- Crea todas las tablas necesarias:
  - `tenants`: Información de cada cliente/empresa
  - `users`: Usuarios de cada tenant
  - `evaluations`: Formularios de evaluación
  - `contacts`: Contactos para enviar evaluaciones
  - `contact_groups`: Grupos de contactos
  - `evaluation_responses`: Respuestas de evaluaciones
  - `report_templates`: Plantillas de reportes
  - `generated_reports`: Reportes generados

**`supabase/migrations/002_rls_policies.sql`**
- Configura la seguridad (RLS - Row Level Security)
- Asegura que cada tenant solo vea sus propios datos
- Define permisos por roles (admin, editor, viewer)

### 2. Conexión con la Aplicación

**`src/lib/supabase/types.ts`**
- Define los tipos de datos de la base de datos
- Generado automáticamente por Supabase

**`src/lib/supabase/client.ts`**
- Cliente para el navegador (frontend)
- Maneja autenticación de usuarios

**`src/lib/supabase/server.ts`**
- Cliente para el servidor (backend)
- Operaciones administrativas

**`src/services/backend/impl.supabase.ts`**
- Implementación del backend usando Supabase
- Conecta la aplicación con la base de datos
- Implementa todas las operaciones CRUD

## Características Implementadas

### ✅ Multi-Tenant
- Cada cliente tiene sus propios datos separados
- Seguridad a nivel de fila (RLS)
- Branding personalizable por tenant

### ✅ Gestión de Contactos
- Crear, editar, eliminar contactos
- Agrupar contactos
- Importar contactos masivamente
- Estados: activo, rebotado, dado de baja

### ✅ Evaluaciones
- Crear formularios de evaluación
- Guardar configuración del formulario
- Estados: borrador, activo, archivado

### ✅ Seguridad
- Autenticación de usuarios
- Roles y permisos
- Aislamiento de datos por tenant

## Próximos Pasos

### 🔄 En Desarrollo
1. **Distribución de Evaluaciones**
   - Envío por email masivo
   - Links públicos
   - Programación de envíos

2. **Respuestas y Reportes**
   - Captura de respuestas
   - Generación de reportes PDF
   - Fórmulas personalizadas

3. **Automatización**
   - Flujos automáticos
   - Integración con servicios externos
   - Notificaciones

## Configuración Requerida

### Variables de Entorno (.env)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

### Cambiar a Supabase
Para usar Supabase en lugar de datos mock, cambiar en `src/config/system.ts`:
```typescript
export const systemConfig = {
  backend: {
    provider: 'supabase', // cambiar de 'mock' a 'supabase'
  }
};
```

## Comandos Útiles

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto local
supabase init

# Ejecutar migraciones
supabase db push

# Ver base de datos local
supabase studio
```

## Beneficios de esta Implementación

1. **Escalabilidad**: Puede manejar múltiples clientes
2. **Seguridad**: Datos aislados por tenant
3. **Flexibilidad**: Fácil cambio entre proveedores
4. **Mantenimiento**: Código organizado y modular
5. **GraphQL**: API moderna y eficiente

-- Script para insertar datos iniciales en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Insertar tenant por defecto
INSERT INTO tenants (
  id,
  name,
  slug,
  subdomain,
  status,
  primary_color,
  secondary_color,
  font_family,
  logo_url,
  settings
) VALUES (
  'default-tenant',
  'EvalAI Demo',
  'default-tenant',
  'demo',
  'active',
  '#3b82f6',
  '#64748b',
  'Inter',
  null,
  '{"features": {"ai_assistance": true, "custom_branding": true, "advanced_analytics": true}}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  subdomain = EXCLUDED.subdomain,
  status = EXCLUDED.status,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  font_family = EXCLUDED.font_family,
  settings = EXCLUDED.settings;

-- Insertar usuario administrador por defecto
INSERT INTO users (
  id,
  tenant_id,
  email,
  first_name,
  last_name,
  role,
  status,
  permissions
) VALUES (
  'admin-user-1',
  'default-tenant',
  'admin@evalai.com',
  'Admin',
  'User',
  'admin',
  'active',
  ARRAY[
    'evaluations.create',
    'evaluations.edit',
    'evaluations.delete',
    'evaluations.view',
    'evaluations.publish',
    'reports.create',
    'reports.edit',
    'reports.view',
    'reports.export',
    'contacts.create',
    'contacts.edit',
    'contacts.import',
    'contacts.export',
    'contacts.delete',
    'users.invite',
    'users.manage',
    'tenant.settings',
    'tenant.branding'
  ]
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  permissions = EXCLUDED.permissions;

-- Insertar algunos grupos de contactos
INSERT INTO contact_groups (
  id,
  tenant_id,
  name,
  description,
  tags,
  contact_count
) VALUES 
(
  'group-employees',
  'default-tenant',
  'Empleados',
  'Grupo de todos los empleados de la empresa',
  ARRAY['empleados', 'interno'],
  0
),
(
  'group-customers',
  'default-tenant',
  'Clientes',
  'Grupo de clientes principales',
  ARRAY['clientes', 'externo'],
  0
),
(
  'group-managers',
  'default-tenant',
  'Gerentes',
  'Grupo de personal gerencial',
  ARRAY['gerentes', 'liderazgo'],
  0
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags;

-- Insertar algunos contactos de ejemplo
INSERT INTO contacts (
  id,
  tenant_id,
  email,
  first_name,
  last_name,
  status,
  custom_fields
) VALUES 
(
  'contact-1',
  'default-tenant',
  'juan.perez@empresa.com',
  'Juan',
  'Pérez',
  'active',
  '{"departamento": "Ventas", "cargo": "Gerente", "telefono": "+57 300 123 4567"}'::jsonb
),
(
  'contact-2',
  'default-tenant',
  'maria.garcia@empresa.com',
  'María',
  'García',
  'active',
  '{"departamento": "Marketing", "cargo": "Coordinadora", "telefono": "+57 301 234 5678"}'::jsonb
),
(
  'contact-3',
  'default-tenant',
  'carlos.rodriguez@empresa.com',
  'Carlos',
  'Rodríguez',
  'active',
  '{"departamento": "IT", "cargo": "Desarrollador", "telefono": "+57 302 345 6789"}'::jsonb
),
(
  'contact-4',
  'default-tenant',
  'ana.martinez@empresa.com',
  'Ana',
  'Martínez',
  'active',
  '{"departamento": "RRHH", "cargo": "Especialista", "telefono": "+57 303 456 7890"}'::jsonb
),
(
  'contact-5',
  'default-tenant',
  'cliente1@empresa.com',
  'Cliente',
  'Uno',
  'active',
  '{"empresa": "Cliente Corp", "sector": "Tecnología", "telefono": "+57 304 567 8901"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  status = EXCLUDED.status,
  custom_fields = EXCLUDED.custom_fields;

-- Asignar contactos a grupos
INSERT INTO contact_group_members (contact_id, group_id) VALUES 
('contact-1', 'group-employees'),
('contact-1', 'group-managers'),
('contact-2', 'group-employees'),
('contact-3', 'group-employees'),
('contact-4', 'group-employees'),
('contact-5', 'group-customers')
ON CONFLICT (contact_id, group_id) DO NOTHING;

-- Actualizar contadores de grupos
UPDATE contact_groups SET contact_count = (
  SELECT COUNT(*) 
  FROM contact_group_members 
  WHERE group_id = contact_groups.id
);

-- Insertar una evaluación de ejemplo
INSERT INTO evaluations (
  id,
  tenant_id,
  title,
  description,
  status,
  created_by,
  form_config
) VALUES (
  'eval-satisfaction',
  'default-tenant',
  'Evaluación de Satisfacción Laboral',
  'Evaluación para medir el nivel de satisfacción de los empleados',
  'draft',
  'admin-user-1',
  '{
    "id": "eval-satisfaction",
    "title": "Evaluación de Satisfacción Laboral",
    "description": "Evaluación para medir el nivel de satisfacción de los empleados",
    "items": [
      {
        "id": "q1",
        "type": "scale",
        "question": "¿Qué tan satisfecho estás con tu trabajo actual?",
        "required": true,
        "config": {
          "min": 1,
          "max": 5,
          "labels": ["Muy insatisfecho", "Insatisfecho", "Neutral", "Satisfecho", "Muy satisfecho"]
        }
      },
      {
        "id": "q2",
        "type": "multipleChoice",
        "question": "¿Cuál es el aspecto más importante para ti en el trabajo?",
        "required": true,
        "config": {
          "options": [
            "Salario competitivo",
            "Ambiente laboral",
            "Oportunidades de crecimiento",
            "Flexibilidad horaria",
            "Reconocimiento"
          ]
        }
      },
      {
        "id": "q3",
        "type": "text",
        "question": "¿Qué sugerencias tienes para mejorar el ambiente laboral?",
        "required": false,
        "config": {
          "multiline": true,
          "placeholder": "Escribe tus sugerencias aquí..."
        }
      }
    ],
    "settings": {
      "allowAnonymous": false,
      "showProgress": true,
      "randomizeQuestions": false
    }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  form_config = EXCLUDED.form_config;

-- Insertar una plantilla de reporte
INSERT INTO report_templates (
  id,
  tenant_id,
  evaluation_id,
  name,
  type,
  pages,
  custom_formulas
) VALUES (
  'template-satisfaction',
  'default-tenant',
  'eval-satisfaction',
  'Reporte de Satisfacción Individual',
  'individual',
  '[
    {
      "id": "cover",
      "type": "cover",
      "title": "Reporte de Satisfacción Laboral",
      "subtitle": "Resultados Individuales",
      "elements": [
        {
          "type": "variable",
          "variable": "participant_name",
          "label": "Participante"
        },
        {
          "type": "variable",
          "variable": "completion_date",
          "label": "Fecha de Completado"
        }
      ]
    },
    {
      "id": "results",
      "type": "content",
      "title": "Resultados",
      "elements": [
        {
          "type": "score",
          "question": "q1",
          "label": "Nivel de Satisfacción"
        },
        {
          "type": "answer",
          "question": "q2",
          "label": "Aspecto Más Importante"
        },
        {
          "type": "text",
          "question": "q3",
          "label": "Sugerencias"
        }
      ]
    }
  ]'::jsonb,
  '{
    "satisfaction_level": {
      "name": "Nivel de Satisfacción",
      "formula": "q1 * 20",
      "description": "Convierte la escala 1-5 a porcentaje"
    }
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  pages = EXCLUDED.pages,
  custom_formulas = EXCLUDED.custom_formulas;

-- Mensaje de confirmación
SELECT 'Datos iniciales insertados correctamente en Supabase' as mensaje;

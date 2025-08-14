-- Ejecutar migraciones y crear tenant por defecto
-- Este script debe ejecutarse después de las migraciones

-- Crear tenant por defecto para la aplicación
INSERT INTO tenants (
  id,
  name,
  slug,
  subdomain,
  status,
  primary_color,
  secondary_color,
  font_family,
  settings
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'EvalAI Demo',
  'default-tenant',
  'demo',
  'active',
  '#3b82f6',
  '#64748b',
  'Inter',
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

-- Crear algunos datos de ejemplo para contactos y grupos
INSERT INTO contact_groups (
  id,
  tenant_id,
  name,
  description,
  tags,
  contact_count
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Clientes VIP', 'Clientes de alto valor', ARRAY['vip', 'premium'], 0),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Empleados', 'Personal interno de la empresa', ARRAY['interno', 'staff'], 0),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Prospects', 'Clientes potenciales', ARRAY['leads', 'marketing'], 0)
ON CONFLICT (id) DO NOTHING;

-- Script para crear roles predefinidos y datos de ejemplo

-- Obtener IDs de permisos para facilitar la asignación
DO $$
DECLARE
    default_tenant_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    admin_role_id UUID;
    editor_role_id UUID;
    viewer_role_id UUID;
    participant_role_id UUID;
    permission_id UUID;
BEGIN
    -- Crear roles predefinidos para el tenant por defecto
    INSERT INTO roles (id, tenant_id, name, description, is_system_role) VALUES
    (gen_random_uuid(), default_tenant_id, 'Admin', 'Administrador con acceso completo', true),
    (gen_random_uuid(), default_tenant_id, 'Editor', 'Editor con permisos de creación y edición', true),
    (gen_random_uuid(), default_tenant_id, 'Viewer', 'Visualizador con permisos de solo lectura', true),
    (gen_random_uuid(), default_tenant_id, 'Participant', 'Participante que solo puede responder evaluaciones', true);

    -- Obtener IDs de los roles creados
    SELECT id INTO admin_role_id FROM roles WHERE tenant_id = default_tenant_id AND name = 'Admin';
    SELECT id INTO editor_role_id FROM roles WHERE tenant_id = default_tenant_id AND name = 'Editor';
    SELECT id INTO viewer_role_id FROM roles WHERE tenant_id = default_tenant_id AND name = 'Viewer';
    SELECT id INTO participant_role_id FROM roles WHERE tenant_id = default_tenant_id AND name = 'Participant';

    -- Asignar TODOS los permisos al rol Admin
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT admin_role_id, id FROM permissions;

    -- Asignar permisos al rol Editor
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT editor_role_id, id FROM permissions 
    WHERE name IN (
        'evaluations.create', 'evaluations.read', 'evaluations.update', 'evaluations.publish', 'evaluations.distribute',
        'contacts.create', 'contacts.read', 'contacts.update', 'contacts.import', 'contacts.export',
        'contact_groups.create', 'contact_groups.read', 'contact_groups.update',
        'reports.create', 'reports.read', 'reports.update', 'reports.export',
        'report_templates.create', 'report_templates.read', 'report_templates.update',
        'dashboard.read', 'analytics.read',
        'ai.use', 'automation.create', 'automation.read', 'automation.update'
    );

    -- Asignar permisos al rol Viewer
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT viewer_role_id, id FROM permissions 
    WHERE name IN (
        'evaluations.read',
        'contacts.read', 'contacts.export',
        'contact_groups.read',
        'reports.read', 'reports.export',
        'report_templates.read',
        'dashboard.read', 'analytics.read'
    );

    -- Asignar permisos mínimos al rol Participant
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT participant_role_id, id FROM permissions 
    WHERE name IN (
        'dashboard.read'
    );

    -- Crear usuario administrador por defecto
    -- Nota: Este usuario debe existir en auth.users primero
    INSERT INTO tenant_users (tenant_id, user_id, email, first_name, last_name, status, joined_at)
    VALUES (
        default_tenant_id,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID del usuario admin
        'admin@evalai.com',
        'Admin',
        'User',
        'active',
        NOW()
    ) ON CONFLICT (tenant_id, email) DO NOTHING;

    -- Asignar rol Admin al usuario administrador
    INSERT INTO user_roles (tenant_user_id, role_id)
    SELECT tu.id, admin_role_id
    FROM tenant_users tu
    WHERE tu.tenant_id = default_tenant_id AND tu.email = 'admin@evalai.com'
    ON CONFLICT (tenant_user_id, role_id) DO NOTHING;

END $$;

-- Crear algunos usuarios de ejemplo
DO $$
DECLARE
    default_tenant_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    editor_role_id UUID;
    viewer_role_id UUID;
BEGIN
    -- Obtener IDs de roles
    SELECT id INTO editor_role_id FROM roles WHERE tenant_id = default_tenant_id AND name = 'Editor';
    SELECT id INTO viewer_role_id FROM roles WHERE tenant_id = default_tenant_id AND name = 'Viewer';

    -- Crear usuarios de ejemplo
    INSERT INTO tenant_users (tenant_id, user_id, email, first_name, last_name, status, joined_at) VALUES
    (default_tenant_id, gen_random_uuid(), 'editor@evalai.com', 'Editor', 'User', 'active', NOW()),
    (default_tenant_id, gen_random_uuid(), 'viewer@evalai.com', 'Viewer', 'User', 'active', NOW()),
    (default_tenant_id, gen_random_uuid(), 'john.doe@example.com', 'John', 'Doe', 'active', NOW()),
    (default_tenant_id, gen_random_uuid(), 'jane.smith@example.com', 'Jane', 'Smith', 'pending', NOW())
    ON CONFLICT (tenant_id, email) DO NOTHING;

    -- Asignar roles a usuarios de ejemplo
    INSERT INTO user_roles (tenant_user_id, role_id)
    SELECT tu.id, editor_role_id
    FROM tenant_users tu
    WHERE tu.tenant_id = default_tenant_id AND tu.email = 'editor@evalai.com'
    ON CONFLICT (tenant_user_id, role_id) DO NOTHING;

    INSERT INTO user_roles (tenant_user_id, role_id)
    SELECT tu.id, viewer_role_id
    FROM tenant_users tu
    WHERE tu.tenant_id = default_tenant_id AND tu.email = 'viewer@evalai.com'
    ON CONFLICT (tenant_user_id, role_id) DO NOTHING;

    INSERT INTO user_roles (tenant_user_id, role_id)
    SELECT tu.id, editor_role_id
    FROM tenant_users tu
    WHERE tu.tenant_id = default_tenant_id AND tu.email = 'john.doe@example.com'
    ON CONFLICT (tenant_user_id, role_id) DO NOTHING;

    INSERT INTO user_roles (tenant_user_id, role_id)
    SELECT tu.id, viewer_role_id
    FROM tenant_users tu
    WHERE tu.tenant_id = default_tenant_id AND tu.email = 'jane.smith@example.com'
    ON CONFLICT (tenant_user_id, role_id) DO NOTHING;

END $$;

-- Crear tabla de permisos (funcionalidades de la app)
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(50) NOT NULL, -- evaluations, contacts, reports, etc.
  action VARCHAR(50) NOT NULL,   -- create, read, update, delete, publish, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de roles por tenant
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE, -- roles predefinidos del sistema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- Crear tabla de relación roles-permisos
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Crear tabla de usuarios por tenant
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- referencia al usuario en auth.users
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id),
  UNIQUE(tenant_id, email)
);

-- Crear tabla de relación usuarios-roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_user_id UUID NOT NULL REFERENCES tenant_users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID, -- referencia al usuario que asignó el rol
  UNIQUE(tenant_user_id, role_id)
);

-- Insertar permisos básicos del sistema
INSERT INTO permissions (name, description, resource, action) VALUES
-- Evaluaciones
('evaluations.create', 'Crear evaluaciones', 'evaluations', 'create'),
('evaluations.read', 'Ver evaluaciones', 'evaluations', 'read'),
('evaluations.update', 'Editar evaluaciones', 'evaluations', 'update'),
('evaluations.delete', 'Eliminar evaluaciones', 'evaluations', 'delete'),
('evaluations.publish', 'Publicar evaluaciones', 'evaluations', 'publish'),
('evaluations.distribute', 'Distribuir evaluaciones', 'evaluations', 'distribute'),

-- Contactos
('contacts.create', 'Crear contactos', 'contacts', 'create'),
('contacts.read', 'Ver contactos', 'contacts', 'read'),
('contacts.update', 'Editar contactos', 'contacts', 'update'),
('contacts.delete', 'Eliminar contactos', 'contacts', 'delete'),
('contacts.import', 'Importar contactos', 'contacts', 'import'),
('contacts.export', 'Exportar contactos', 'contacts', 'export'),

-- Grupos de contactos
('contact_groups.create', 'Crear grupos de contactos', 'contact_groups', 'create'),
('contact_groups.read', 'Ver grupos de contactos', 'contact_groups', 'read'),
('contact_groups.update', 'Editar grupos de contactos', 'contact_groups', 'update'),
('contact_groups.delete', 'Eliminar grupos de contactos', 'contact_groups', 'delete'),

-- Reportes
('reports.create', 'Crear reportes', 'reports', 'create'),
('reports.read', 'Ver reportes', 'reports', 'read'),
('reports.update', 'Editar reportes', 'reports', 'update'),
('reports.delete', 'Eliminar reportes', 'reports', 'delete'),
('reports.export', 'Exportar reportes', 'reports', 'export'),

-- Plantillas de reportes
('report_templates.create', 'Crear plantillas de reportes', 'report_templates', 'create'),
('report_templates.read', 'Ver plantillas de reportes', 'report_templates', 'read'),
('report_templates.update', 'Editar plantillas de reportes', 'report_templates', 'update'),
('report_templates.delete', 'Eliminar plantillas de reportes', 'report_templates', 'delete'),

-- Dashboard
('dashboard.read', 'Ver dashboard', 'dashboard', 'read'),
('analytics.read', 'Ver analíticas avanzadas', 'analytics', 'read'),

-- Configuración del tenant
('tenant.read', 'Ver configuración del tenant', 'tenant', 'read'),
('tenant.update', 'Editar configuración del tenant', 'tenant', 'update'),

-- Gestión de usuarios
('users.create', 'Invitar usuarios', 'users', 'create'),
('users.read', 'Ver usuarios', 'users', 'read'),
('users.update', 'Editar usuarios', 'users', 'update'),
('users.delete', 'Eliminar usuarios', 'users', 'delete'),

-- Gestión de roles
('roles.create', 'Crear roles', 'roles', 'create'),
('roles.read', 'Ver roles', 'roles', 'read'),
('roles.update', 'Editar roles', 'roles', 'update'),
('roles.delete', 'Eliminar roles', 'roles', 'delete'),

-- IA y automatización
('ai.use', 'Usar funciones de IA', 'ai', 'use'),
('automation.create', 'Crear automatizaciones', 'automation', 'create'),
('automation.read', 'Ver automatizaciones', 'automation', 'read'),
('automation.update', 'Editar automatizaciones', 'automation', 'update'),
('automation.delete', 'Eliminar automatizaciones', 'automation', 'delete');

-- Crear índices para optimizar consultas
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX idx_user_roles_tenant_user_id ON user_roles(tenant_user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Crear triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permissions (solo lectura para todos los usuarios autenticados)
CREATE POLICY "Permissions are readable by authenticated users" ON permissions
  FOR SELECT TO authenticated USING (true);

-- Políticas RLS para roles (solo del tenant del usuario)
CREATE POLICY "Roles are accessible by tenant members" ON roles
  FOR ALL TO authenticated 
  USING (
    tenant_id IN (
      SELECT tu.tenant_id 
      FROM tenant_users tu 
      WHERE tu.user_id = auth.uid()
    )
  );

-- Políticas RLS para role_permissions
CREATE POLICY "Role permissions are accessible by tenant members" ON role_permissions
  FOR ALL TO authenticated 
  USING (
    role_id IN (
      SELECT r.id 
      FROM roles r 
      JOIN tenant_users tu ON r.tenant_id = tu.tenant_id 
      WHERE tu.user_id = auth.uid()
    )
  );

-- Políticas RLS para tenant_users
CREATE POLICY "Tenant users are accessible by tenant members" ON tenant_users
  FOR ALL TO authenticated 
  USING (
    tenant_id IN (
      SELECT tu.tenant_id 
      FROM tenant_users tu 
      WHERE tu.user_id = auth.uid()
    )
  );

-- Políticas RLS para user_roles
CREATE POLICY "User roles are accessible by tenant members" ON user_roles
  FOR ALL TO authenticated 
  USING (
    tenant_user_id IN (
      SELECT tu.id 
      FROM tenant_users tu 
      WHERE tu.tenant_id IN (
        SELECT tu2.tenant_id 
        FROM tenant_users tu2 
        WHERE tu2.user_id = auth.uid()
      )
    )
  );

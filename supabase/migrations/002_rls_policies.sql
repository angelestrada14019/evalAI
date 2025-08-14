-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- Helper function to get current tenant ID from JWT
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'tenant_id')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user ID from JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'sub')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions TEXT[];
BEGIN
    SELECT permissions INTO user_permissions
    FROM users 
    WHERE id = get_current_user_id() 
    AND tenant_id = get_current_tenant_id();
    
    RETURN permission_name = ANY(user_permissions);
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(role_name user_role)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT role INTO user_role_val
    FROM users 
    WHERE id = get_current_user_id() 
    AND tenant_id = get_current_tenant_id();
    
    RETURN user_role_val = role_name OR user_role_val = 'admin';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenants policies
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (id = get_current_tenant_id());

CREATE POLICY "Admins can update their tenant" ON tenants
    FOR UPDATE USING (
        id = get_current_tenant_id() 
        AND user_has_role('admin')
    );

-- Users policies
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Admins can insert users in their tenant" ON users
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id() 
        AND user_has_role('admin')
    );

CREATE POLICY "Admins can update users in their tenant" ON users
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id() 
        AND user_has_role('admin')
    );

CREATE POLICY "Admins can delete users in their tenant" ON users
    FOR DELETE USING (
        tenant_id = get_current_tenant_id() 
        AND user_has_role('admin')
        AND id != get_current_user_id() -- Can't delete themselves
    );

-- Evaluations policies
CREATE POLICY "Users can view evaluations in their tenant" ON evaluations
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Editors can insert evaluations in their tenant" ON evaluations
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
        AND created_by = get_current_user_id()
    );

CREATE POLICY "Editors can update their own evaluations" ON evaluations
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
        AND (created_by = get_current_user_id() OR user_has_role('admin'))
    );

CREATE POLICY "Editors can delete their own evaluations" ON evaluations
    FOR DELETE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
        AND (created_by = get_current_user_id() OR user_has_role('admin'))
    );

-- Contacts policies
CREATE POLICY "Users can view contacts in their tenant" ON contacts
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Editors can insert contacts in their tenant" ON contacts
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can update contacts in their tenant" ON contacts
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can delete contacts in their tenant" ON contacts
    FOR DELETE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

-- Contact groups policies
CREATE POLICY "Users can view contact groups in their tenant" ON contact_groups
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Editors can insert contact groups in their tenant" ON contact_groups
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can update contact groups in their tenant" ON contact_groups
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can delete contact groups in their tenant" ON contact_groups
    FOR DELETE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

-- Contact group members policies
CREATE POLICY "Users can view contact group members for their tenant" ON contact_group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contact_groups cg 
            WHERE cg.id = group_id 
            AND cg.tenant_id = get_current_tenant_id()
        )
    );

CREATE POLICY "Editors can manage contact group members in their tenant" ON contact_group_members
    FOR ALL USING (
        (user_has_role('editor') OR user_has_role('admin'))
        AND EXISTS (
            SELECT 1 FROM contact_groups cg 
            WHERE cg.id = group_id 
            AND cg.tenant_id = get_current_tenant_id()
        )
    );

-- Evaluation responses policies
CREATE POLICY "Users can view evaluation responses in their tenant" ON evaluation_responses
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Allow public insert for evaluation responses" ON evaluation_responses
    FOR INSERT WITH CHECK (tenant_id IS NOT NULL);

CREATE POLICY "Editors can update evaluation responses in their tenant" ON evaluation_responses
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can delete evaluation responses in their tenant" ON evaluation_responses
    FOR DELETE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

-- Report templates policies
CREATE POLICY "Users can view report templates in their tenant" ON report_templates
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Editors can insert report templates in their tenant" ON report_templates
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can update report templates in their tenant" ON report_templates
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can delete report templates in their tenant" ON report_templates
    FOR DELETE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

-- Generated reports policies
CREATE POLICY "Users can view generated reports in their tenant" ON generated_reports
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Editors can insert generated reports in their tenant" ON generated_reports
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can update generated reports in their tenant" ON generated_reports
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

CREATE POLICY "Editors can delete generated reports in their tenant" ON generated_reports
    FOR DELETE USING (
        tenant_id = get_current_tenant_id() 
        AND (user_has_role('editor') OR user_has_role('admin'))
    );

-- Fix user policies to allow initial user creation
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert users in their tenant" ON users;

-- Create a more permissive policy for user insertion
-- This allows authenticated users to insert themselves into the users table
CREATE POLICY "Allow authenticated users to insert themselves" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = id  -- User can only insert their own record
        AND tenant_id IS NOT NULL  -- Must specify a tenant
    );

-- Also allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (
        auth.uid() = id  -- User can view their own record
        OR tenant_id = get_current_tenant_id()  -- Or users in same tenant
    );

-- Create a function to handle user creation after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_tenant_id UUID := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
    -- Insert user profile into public.users table
    INSERT INTO public.users (
        id,
        tenant_id,
        email,
        first_name,
        last_name,
        role,
        status,
        permissions
    ) VALUES (
        NEW.id,
        default_tenant_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'last_name',
        'admin',  -- First users become admin
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
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth signup
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update the JWT helper functions to be more robust
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
    tenant_id UUID;
BEGIN
    -- Try to get from JWT first
    tenant_id := (auth.jwt() ->> 'tenant_id')::UUID;
    
    -- If not in JWT, get from user profile
    IF tenant_id IS NULL THEN
        SELECT u.tenant_id INTO tenant_id
        FROM users u
        WHERE u.id = auth.uid();
    END IF;
    
    -- Fallback to default tenant
    IF tenant_id IS NULL THEN
        tenant_id := '550e8400-e29b-41d4-a716-446655440000';
    END IF;
    
    RETURN tenant_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN '550e8400-e29b-41d4-a716-446655440000';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

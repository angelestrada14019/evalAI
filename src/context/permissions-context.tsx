'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Permission, Role, UserRole, PermissionCheck, UserWithPermissions } from '@/types/permissions';
import { backend } from '@/services/backend/backend';
import { useTenant } from './tenant-context';
import { useAuth } from './auth-context';

interface PermissionsContextType {
  userPermissions: Permission[];
  userRoles: Role[];
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentTenant } = useTenant();
  const { user } = useAuth();

  const loadUserPermissions = async () => {
    if (!currentTenant?.id || !user?.id) {
      setUserPermissions([]);
      setUserRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load user permissions and roles
      const [permissions, roles] = await Promise.all([
        backend().getUserPermissions(currentTenant.id, user.id),
        backend().getRoles(currentTenant.id)
      ]);

      // Get user's specific roles
      const tenantUser = await backend().getTenantUser(currentTenant.id, user.id);
      const userRoleIds = tenantUser?.roleIds || [];
      const filteredRoles = roles.filter(role => userRoleIds.includes(role.id));

      setUserPermissions(permissions);
      setUserRoles(filteredRoles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
      setUserPermissions([]);
      setUserRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPermissions = async () => {
    await loadUserPermissions();
  };

  // Reload permissions when tenant or user changes
  useEffect(() => {
    loadUserPermissions();
  }, [currentTenant?.id, user?.id]);

  // Permission check functions
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  };

  const value: PermissionsContextType = {
    userPermissions,
    userRoles,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Component for conditional rendering based on permissions
interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  fallback?: ReactNode;
}

export function PermissionGate({ 
  children, 
  permission, 
  permissions, 
  requireAll = false, 
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // No permissions specified, show children
  return <>{children}</>;
}

// Hook for checking permissions with loading state
export function usePermissionCheck() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  const checkPermission = (permission: Permission): boolean => {
    if (isLoading) return false;
    return hasPermission(permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (isLoading) return false;
    return hasAnyPermission(permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (isLoading) return false;
    return hasAllPermissions(permissions);
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    isLoading,
  };
}

// Hook for role-based checks
export function useRoles() {
  const { userRoles, isLoading } = usePermissions();

  const hasRole = (roleName: string): boolean => {
    if (isLoading) return false;
    return userRoles.some(role => role.name === roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (isLoading) return false;
    return roleNames.some(roleName => hasRole(roleName));
  };

  const hasAllRoles = (roleNames: string[]): boolean => {
    if (isLoading) return false;
    return roleNames.every(roleName => hasRole(roleName));
  };

  return {
    userRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isLoading,
  };
}

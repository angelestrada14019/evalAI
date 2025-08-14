'use client'

import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { FormBuilderProvider } from '@/context/form-builder-context';
import { TenantProvider } from '@/context/tenant-context';
import { PermissionsProvider } from '@/context/permissions-context';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <TenantProvider>
                <PermissionsProvider>
                    <FormBuilderProvider>
                        {children}
                    </FormBuilderProvider>
                </PermissionsProvider>
            </TenantProvider>
        </AuthProvider>
    );
}

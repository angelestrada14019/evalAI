
'use client'

import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { FormBuilderProvider } from '@/context/form-builder-context';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <FormBuilderProvider>
                {children}
            </FormBuilderProvider>
        </AuthProvider>
    );
}

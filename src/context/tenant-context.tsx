'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '@/types/tenant';
import { backend } from '@/services/backend/backend';

interface TenantContextType {
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  initialTenantId?: string;
}

export function TenantProvider({ children, initialTenantId }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenant = async (tenantId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const tenant = await backend().getTenant(tenantId);
      setCurrentTenant(tenant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenant');
      setCurrentTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenant = async () => {
    if (currentTenant?.id) {
      await loadTenant(currentTenant.id);
    }
  };

  useEffect(() => {
    // Get tenant ID from initialTenantId prop or resolve from hostname
    const tenantId = initialTenantId || getTenantIdFromHost() || 'localhost-tenant';
    
    if (tenantId) {
      loadTenant(tenantId);
    } else {
      setIsLoading(false);
    }
  }, [initialTenantId]);

  // Apply tenant branding when tenant changes
  useEffect(() => {
    if (currentTenant?.branding) {
      applyTenantBranding(currentTenant.branding);
    }
  }, [currentTenant]);

  const value: TenantContextType = {
    currentTenant,
    isLoading,
    error,
    setCurrentTenant,
    refreshTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// Helper function to resolve tenant from hostname
function getTenantIdFromHost(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // For development
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    // Check for tenant parameter in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const tenantFromUrl = urlParams.get('tenant');
    if (tenantFromUrl) {
      localStorage.setItem('dev-tenant', tenantFromUrl);
      return tenantFromUrl;
    }
    return localStorage.getItem('dev-tenant');
  }
  
  // For production - extract subdomain
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0]; // subdomain
  }
  
  return null;
}

// Helper function to apply tenant branding
function applyTenantBranding(branding: Tenant['branding']) {
  const root = document.documentElement;
  
  // Apply CSS custom properties for theming
  root.style.setProperty('--tenant-primary', branding.primaryColor);
  root.style.setProperty('--tenant-secondary', branding.secondaryColor);
  root.style.setProperty('--tenant-accent', branding.accentColor);
  root.style.setProperty('--tenant-font-family', branding.fontFamily);
  
  // Apply custom CSS if provided
  if (branding.customCSS) {
    let customStyleElement = document.getElementById('tenant-custom-styles');
    if (!customStyleElement) {
      customStyleElement = document.createElement('style');
      customStyleElement.id = 'tenant-custom-styles';
      document.head.appendChild(customStyleElement);
    }
    customStyleElement.textContent = branding.customCSS;
  }
  
  // Update favicon if logo is provided
  if (branding.logo) {
    updateFavicon(branding.logo);
  }
}

// Helper function to update favicon
function updateFavicon(logoUrl: string) {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = logoUrl;
  } else {
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.href = logoUrl;
    document.head.appendChild(newFavicon);
  }
}

// Hook for tenant switching (development only)
export function useTenantSwitcher() {
  const { setCurrentTenant } = useTenant();
  
  const switchTenant = async (tenantId: string) => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('dev-tenant', tenantId);
      window.location.search = `?tenant=${tenantId}`;
    }
  };
  
  return { switchTenant };
}

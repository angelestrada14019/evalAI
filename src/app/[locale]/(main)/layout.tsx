
'use client';

import React from 'react';
import { Providers } from '@/context/providers';
import { MainLayoutContent } from '@/components/layout/main-layout-content';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <MainLayoutContent>{children}</MainLayoutContent>
    </Providers>
  );
}

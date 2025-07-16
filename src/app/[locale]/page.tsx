
'use client';

import { useEffect } from 'react';
import { useRouter } from '@/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null; // O un componente de carga si se prefiere
}

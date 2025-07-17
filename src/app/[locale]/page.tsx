
'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}

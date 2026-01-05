'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=orders');
  }, [router]);

  return null;
}


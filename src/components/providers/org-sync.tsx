'use client';

import { useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { syncOrganization } from '@/lib/sync-org';

export function OrgSync() {
  const { organization, isLoaded } = useOrganization();

  useEffect(() => {
    if (!isLoaded || !organization) {
      return;
    }

    syncOrganization().catch((error) => {
      console.error('Failed to sync organization:', error);
    });
  }, [isLoaded, organization?.id]);

  return null;
}


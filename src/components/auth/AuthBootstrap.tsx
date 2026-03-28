'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

type PersistApi = {
  hasHydrated?: () => boolean;
  onHydrate?: (listener: () => void) => () => void;
  onFinishHydration?: (listener: () => void) => () => void;
};

function getPersistApi(): PersistApi | undefined {
  return (useAuthStore as unknown as { persist?: PersistApi }).persist;
}

export function AuthBootstrap() {
  const { isAuthLoading, bootstrapAuth } = useAuthStore();
  // `useAuthStore.persist` helpers may be undefined in some environments.
  const [hydrated, setHydrated] = useState(() =>
    typeof getPersistApi()?.hasHydrated === 'function' ? getPersistApi()!.hasHydrated!() : true
  );
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    const persistApi = getPersistApi();

    if (persistApi?.onHydrate && persistApi?.onFinishHydration) {
      const unsubHydrate = persistApi.onHydrate(() => setHydrated(false));
      const unsubFinish = persistApi.onFinishHydration(() => setHydrated(true));

      return () => {
        unsubHydrate();
        unsubFinish();
      };
    }
  }, []);

  useEffect(() => {
    if (!hydrated || hasBootstrappedRef.current || !isAuthLoading) return;

    hasBootstrappedRef.current = true;
    void bootstrapAuth();
  }, [hydrated, isAuthLoading, bootstrapAuth]);

  return null;
}

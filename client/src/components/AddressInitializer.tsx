"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAddressStore } from "@/store/useAddressStore";

export default function AddressInitializer() {
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id);

  const setSession = useAddressStore((state) => state.setSession);

  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (token && userId) {
      void setSession("user", userId);
    } else {
      void setSession("guest");
    }
  }, [hydrated, token, userId, setSession]);

  return null;
}

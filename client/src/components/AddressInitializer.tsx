
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAddressStore } from "@/store/useAddressStore";

export default function AddressInitializer() {
  const setSession = useAddressStore((state) => state.setSession);

  useEffect(() => {
    const syncSession = () => {
      const { token, user } = useAuthStore.getState();

      if (token && user?.id) {
        void setSession("user", user.id);
      } else {
        void setSession("guest");
      }
    };

    const persist = useAuthStore.persist;

    if (!persist) {
      console.error("Auth persistence middleware is not configured.");
      return;
    }

    if (persist.hasHydrated()) {
      syncSession();
      return;
    }

    const unsubscribe = persist.onFinishHydration(syncSession);

    return unsubscribe;
  }, [setSession]);

  return null;
}

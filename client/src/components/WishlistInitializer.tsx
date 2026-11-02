
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function WishlistInitializer() {
  const cartMode = useCartStore((s) => s.mode);
  const cartReady = useCartStore((s) => s.ready);

  const setSession = useWishlistStore(
    (s) => s.setSession
  );

  useEffect(() => {
    console.log("[Wishlist] Cart mode:", cartMode);
    console.log("[Wishlist] Cart ready:", cartReady);

    if (!cartReady || cartMode === "unknown") {
      console.warn(
        "[Wishlist] Waiting for authenticated session"
      );
      return;
    }

    void setSession(cartMode).catch((error) => {
      console.error(
        "[Wishlist] Initialization failed:",
        error
      );
    });
  }, [cartMode, cartReady, setSession]);

  return null;
}

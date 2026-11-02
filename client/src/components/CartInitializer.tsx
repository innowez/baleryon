
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function CartInitializer() {
  const initialize = useCartStore(
    (state) => state.initialize
  );

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return null;
}

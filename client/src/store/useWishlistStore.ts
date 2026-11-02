
"use client";

import { create } from "zustand";
import {
  wishlistApi,
  type WishlistItem,
} from "@/lib/wishlistApi";
import type { Mode } from "@/store/useCartStore";

export type { WishlistItem } from "@/lib/wishlistApi";

const STORAGE_KEY = "wishlist-storage";

export type WishlistResult =
  | { ok: true }
  | { ok: false; message: string };

type NewWishlistItem = Omit<
  WishlistItem,
  "addedAt"
>;

interface WishlistState {
  items: WishlistItem[];
  mode: Mode;
  ready: boolean;
  syncing: boolean;
  error: string | null;

  setSession: (mode: "guest" | "user") => Promise<void>;
  refresh: () => Promise<void>;

  isFavorited: (productId: string) => boolean;

  addToWishlist: (
    item: NewWishlistItem
  ) => Promise<WishlistResult>;

  removeFromWishlist: (
    productId: string
  ) => Promise<WishlistResult>;

  clearWishlist: () => Promise<WishlistResult>;
  getWishlistCount: () => number;
}

function readGuest(): WishlistItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    // Compatible with the old Zustand persist format:
    // { state: { items: [...] }, version: 0 }
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed)
      ? parsed
      : parsed?.state?.items;

    if (!Array.isArray(items)) return [];

    return items.filter(
      (item): item is WishlistItem =>
        item &&
        typeof item.productId === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.image === "string"
    );
  } catch {
    return [];
  }
}

function saveGuest(items: WishlistItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items)
  );
}

export function clearGuestWishlistStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

const getError = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Wishlist operation failed.";

let revision = 0;

export const useWishlistStore =
  create<WishlistState>((set, get) => {
    const syncServer = async (
      operation: () => Promise<{
        items: WishlistItem[];
      }>
    ): Promise<WishlistResult> => {
      const token = revision;

      set({
        syncing: true,
        error: null,
      });

      try {
        const response = await operation();

        if (
          token !== revision ||
          get().mode !== "user"
        ) {
          return {
            ok: false,
            message: "Wishlist session changed.",
          };
        }

        set({
          items: response.items,
          error: null,
        });

        return { ok: true };
      } catch (error) {
        if (token === revision) {
          set({ error: getError(error) });
        }

        return {
          ok: false,
          message: getError(error),
        };
      } finally {
        if (token === revision) {
          set({ syncing: false });
        }
      }
    };

    return {
      items: [],
      mode: "unknown",
      ready: false,
      syncing: false,
      error: null,

      setSession: async (mode) => {
        const previous = get().mode;

        if (
          previous === mode &&
          get().ready
        ) {
          return;
        }

        const token = ++revision;

        // Clear guest storage when changing sessions.
        // Preserve storage on first guest page load.
        if (
          previous !== "unknown" ||
          mode === "user"
        ) {
          clearGuestWishlistStorage();
        }

        if (mode === "guest") {
          const items =
            previous === "unknown"
              ? readGuest()
              : [];

          set({
            items,
            mode: "guest",
            ready: true,
            syncing: false,
            error: null,
          });

          return;
        }

        set({
          items: [],
          mode: "user",
          ready: false,
          syncing: true,
          error: null,
        });

        try {
          const result = await wishlistApi.get();

          if (token === revision) {
            set({
              items: result.items,
              ready: true,
              error: null,
            });
          }
        } catch (error) {
          if (token === revision) {
            set({
              ready: false,
              error: getError(error),
            });
          }
        } finally {
          if (token === revision) {
            set({ syncing: false });
          }
        }
      },

      refresh: async () => {
        const { mode } = get();

        if (mode === "guest") {
          // Guest wishlist is already held in Zustand.
          return;
        }

        if (mode === "user") {
          const result = await syncServer(
            wishlistApi.get
          );

          if (result.ok) {
            set({ ready: true });
          }

          return;
        }
      },

      isFavorited: (productId) =>
        get().items.some(
          (item) => item.productId === productId
        ),

      addToWishlist: async (item) => {
        const { mode, ready } = get();

        if (!ready) {
          return {
            ok: false,
            message: "Wishlist is initializing.",
          };
        }

        if (
          get().items.some(
            (i) => i.productId === item.productId
          )
        ) {
          return { ok: true };
        }

        if (mode === "user") {
          return syncServer(() =>
            wishlistApi.add(item.productId)
          );
        }

        if (mode !== "guest") {
          return {
            ok: false,
            message: "Wishlist session is unknown.",
          };
        }

        const updated = [
          ...get().items,
          {
            ...item,
            addedAt: Date.now(),
          },
        ];

        saveGuest(updated);
        set({ items: updated });

        return { ok: true };
      },

      removeFromWishlist: async (productId) => {
        const { mode, ready } = get();

        if (!ready) {
          return {
            ok: false,
            message: "Wishlist is initializing.",
          };
        }

        if (mode === "user") {
          return syncServer(() =>
            wishlistApi.remove(productId)
          );
        }

        if (mode !== "guest") {
          return {
            ok: false,
            message: "Wishlist session is unknown.",
          };
        }

        const updated = get().items.filter(
          (item) => item.productId !== productId
        );

        saveGuest(updated);
        set({ items: updated });

        return { ok: true };
      },

      clearWishlist: async () => {
        const { mode, ready } = get();

        if (!ready) {
          return {
            ok: false,
            message: "Wishlist is initializing.",
          };
        }

        if (mode === "user") {
          return syncServer(wishlistApi.clear);
        }

        if (mode !== "guest") {
          return {
            ok: false,
            message: "Wishlist session is unknown.",
          };
        }

        clearGuestWishlistStorage();
        set({ items: [] });

        return { ok: true };
      },

      getWishlistCount: () =>
        get().items.length,
    };
  });

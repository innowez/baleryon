"use client";

import { create } from "zustand";

import {
  createAddress,
  getAddresses,
  updateAddress as updateAddressApi,
  deleteAddress as deleteAddressApi,
  setDefaultAddress as setDefaultAddressApi,
  type Address,
  type AddressInput,
  type UpdateAddressInput,
} from "@/lib/addressApi";

export type { Address } from "@/lib/addressApi";

type AddressMode = "unknown" | "guest" | "user";

const GUEST_ADDRESS_KEY = "guest-addresses-v2";
const OLD_KEY = "address-storage";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Address request failed.";

function readGuestAddresses(): Address[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(GUEST_ADDRESS_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestAddresses(addresses: Address[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(addresses));
}

export function clearGuestAddressStorage() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(GUEST_ADDRESS_KEY);

  // Old Zustand persist key may contain logged-in addresses.
  localStorage.removeItem(OLD_KEY);
}

function getSelectedId(
  addresses: Address[],
  preferred?: string | null,
): string | null {
  if (preferred && addresses.some((address) => address.id === preferred)) {
    return preferred;
  }

  return (
    addresses.find((address) => address.isDefault)?.id ??
    addresses[0]?.id ??
    null
  );
}

// Prevent old API responses overwriting a new session.
let revision = 0;

// Guest addresses captured at the moment of login/signup, waiting to be saved
// to the account. Lives in memory only; consumed once by setSession("user").
let pendingGuestAddresses: Address[] = [];

const norm = (v?: string | null) =>
  (v ?? "").trim().toLowerCase().replace(/\s+/g, " ");

// Same address if line 1 + postal code + phone match.
const isSameAddress = (a: Address, b: Address) =>
  norm(a.addressLine1) === norm(b.addressLine1) &&
  norm(a.postalCode) === norm(b.postalCode) &&
  norm(a.phone) === norm(b.phone);

/** Saves guest addresses to the DB (skipping ones the account already has). */
async function migrateGuestAddresses(
  guest: Address[],
  existing: Address[],
): Promise<Address[]> {
  let needsDefault = !existing.some((a) => a.isDefault);
  let created = 0;

  // Sequential on purpose: keeps order and avoids two "default" races.
  for (const g of guest) {
    if (existing.some((e) => isSameAddress(g, e))) continue;

    // Strip guest-only fields (local id / createdAt / isDefault).
    const { id: _id, createdAt: _c, isDefault: _d, ...rest } = g;

    try {
      await createAddress({
        ...rest,
        // Only become default if the account has no default yet.
        isDefault: needsDefault && g.isDefault,
      });
      if (needsDefault && g.isDefault) needsDefault = false;
      created++;
    } catch (error) {
      // One bad address must not block login or the others.
      console.error("[Guest address migration]", error);
    }
  }

  return created > 0 ? await getAddresses() : existing;
}

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;

  mode: AddressMode;
  currentUserId: string | null;
  ready: boolean;
  loading: boolean;
  error: string | null;

  setSession: (mode: "guest" | "user", userId?: string) => Promise<void>;

  fetchAddresses: (userId?: string) => Promise<void>;

  addAddress: (data: AddressInput) => Promise<Address | null>;

  updateAddress: (id: string, data: UpdateAddressInput) => Promise<void>;

  deleteAddress: (id: string) => Promise<void>;

  setDefaultAddress: (userId: string, addressId: string) => Promise<void>;

  selectAddress: (id: string) => void;

  clearAddresses: () => void;

  getSelectedAddress: () => Address | null;
}

export const useAddressStore = create<AddressState>((set, get) => {
  const applyAddresses = (addresses: Address[]) => {
    const selectedAddressId = getSelectedId(addresses, get().selectedAddressId);

    set({
      addresses,
      selectedAddressId,
      error: null,
    });
  };

  const ensureReady = () => {
    if (!get().ready || get().mode === "unknown") {
      throw new Error("Addresses are still initializing.");
    }
  };

  return {
    addresses: [],
    selectedAddressId: null,
    mode: "unknown",
    currentUserId: null,
    ready: false,
    loading: false,
    error: null,

    // Called after auth is hydrated or changes.
    setSession: async (mode, userId) => {
      if (mode === "user" && !userId) {
        set({
          ready: false,
          error: "Authenticated user ID is missing.",
        });
        return;
      }

      const previous = get();

      if (
        previous.mode === mode &&
        previous.ready &&
        (mode === "guest" || previous.currentUserId === userId)
      ) {
        return;
      }

      const token = ++revision;

      // Never migrate guest addresses automatically.
      // First-time guest sessions may restore saved guest data.
      const firstGuestLoad = previous.mode === "unknown" && mode === "guest";

      if (!firstGuestLoad) {
        clearGuestAddressStorage();
      }

      if (mode === "guest") {
        const addresses = firstGuestLoad ? readGuestAddresses() : [];

        set({
          addresses,
          selectedAddressId: getSelectedId(addresses),
          mode: "guest",
          currentUserId: null,
          ready: true,
          loading: false,
          error: null,
        });

        return;
      }

      // Authenticated addresses are never persisted locally.
      set({
        addresses: [],
        selectedAddressId: null,
        mode: "user",
        currentUserId: userId!,
        ready: false,
        loading: true,
        error: null,
      });

      try {
        let addresses = await getAddresses(userId);

        if (token !== revision) return;

        // Save guest addresses to the account (once), then reload the list.
        if (pendingGuestAddresses.length > 0) {
          const pending = pendingGuestAddresses;
          pendingGuestAddresses = []; // consume first so it can't run twice

          try {
            addresses = await migrateGuestAddresses(pending, addresses);
          } catch (migrationError) {
            // Keep the already-loaded list if the final reload fails.
            console.error("[Guest address migration]", migrationError);
          }

          if (token !== revision) return;
        }

        set({
          addresses,
          selectedAddressId: getSelectedId(addresses),
          ready: true,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (token !== revision) return;

        set({
          addresses: [],
          ready: false,
          loading: false,
          error: errorMessage(error),
        });

        console.error("[Address session load]", error);
      }
    },

    fetchAddresses: async (_userId) => {
      const state = get();

      if (state.mode === "unknown") return;

      if (state.mode === "guest") {
        // Guest addresses already live in Zustand.
        return;
      }

      const token = revision;

      set({ loading: true, error: null });

      try {
        const addresses = await getAddresses(state.currentUserId ?? undefined);

        if (token !== revision || get().mode !== "user") {
          return;
        }

        applyAddresses(addresses);
        set({ ready: true });
      } catch (error) {
        if (token === revision) {
          set({
            error: errorMessage(error),
          });
        }

        console.error("Fetch addresses failed:", error);
      } finally {
        if (token === revision) {
          set({ loading: false });
        }
      }
    },

    addAddress: async (data) => {
      const state = get();

      if (!state.ready || state.mode === "unknown") {
        throw new Error("Address session is not ready.");
      }

      if (state.mode === "guest") {
        const isDefault =
          state.addresses.length === 0 || data.isDefault === true;

        const address: Address = {
          id: crypto.randomUUID(),
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          isDefault,
          createdAt: new Date().toISOString(),
        };

        const addresses = [
          ...state.addresses.map((item) => ({
            ...item,
            isDefault: isDefault ? false : item.isDefault,
          })),
          address,
        ];

        saveGuestAddresses(addresses);

        set({
          addresses,
          selectedAddressId: address.id,
          error: null,
        });

        return address;
      }

      // Logged-in user: save to backend.
      const { userId: _ignored, ...payload } = data;

      const address = await createAddress(payload);

      await get().fetchAddresses();

      return address;
    },

    updateAddress: async (id, data) => {
      ensureReady();
      const token = revision;

      try {
        if (get().mode === "guest") {
          const updated = get().addresses.map((address) =>
            address.id === id
              ? {
                  ...address,
                  ...data,
                  id: address.id,
                  isDefault: address.isDefault,
                  createdAt: address.createdAt,
                }
              : address,
          );

          saveGuestAddresses(updated);
          applyAddresses(updated);
          return;
        }

        await updateAddressApi(id, data);

        if (token === revision) {
          await get().fetchAddresses();
        }
      } catch (error) {
        set({ error: errorMessage(error) });
        throw error;
      }
    },

    deleteAddress: async (id) => {
      ensureReady();
      const token = revision;

      try {
        if (get().mode === "guest") {
          const current = get().addresses.find((address) => address.id === id);

          let updated = get().addresses.filter((address) => address.id !== id);

          if (current?.isDefault && updated.length > 0) {
            updated = updated.map((address, index) => ({
              ...address,
              isDefault: index === 0,
            }));
          }

          saveGuestAddresses(updated);
          applyAddresses(updated);
          return;
        }

        await deleteAddressApi(id);

        if (token === revision) {
          await get().fetchAddresses();
        }
      } catch (error) {
        set({ error: errorMessage(error) });
        throw error;
      }
    },

    setDefaultAddress: async (_userId, addressId) => {
      ensureReady();
      const token = revision;

      try {
        if (get().mode === "guest") {
          const updated = get().addresses.map((address) => ({
            ...address,
            isDefault: address.id === addressId,
          }));

          saveGuestAddresses(updated);

          set({
            addresses: updated,
            selectedAddressId: addressId,
            error: null,
          });

          return;
        }

        await setDefaultAddressApi(get().currentUserId ?? "", addressId);

        if (token === revision) {
          await get().fetchAddresses();

          set({
            selectedAddressId: addressId,
          });
        }
      } catch (error) {
        set({ error: errorMessage(error) });
        throw error;
      }
    },

    selectAddress: (id) => {
      if (get().addresses.some((address) => address.id === id)) {
        set({ selectedAddressId: id });
      }
    },

    clearAddresses: () => {
      ++revision;

      clearGuestAddressStorage();

      set({
        addresses: [],
        selectedAddressId: null,
        mode: "guest",
        currentUserId: null,
        ready: true,
        loading: false,
        error: null,
      });
    },

    getSelectedAddress: () => {
      const state = get();

      return (
        state.addresses.find(
          (address) => address.id === state.selectedAddressId,
        ) ?? null
      );
    },
  };
});

/**
 * Call right BEFORE auth state flips to logged-in. It copies the in-memory
 * guest addresses so setSession("user") can save them to the account.
 */
export function stashGuestAddresses() {
  const { mode, addresses } = useAddressStore.getState();
  pendingGuestAddresses = mode === "guest" ? [...addresses] : [];
}
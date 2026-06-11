// store/useAddressStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createAddress,
  getAddresses,
  updateAddress as updateAddressApi,
  deleteAddress as deleteAddressApi,
  setDefaultAddress as setDefaultAddressApi,
  type AddressInput,
  UpdateAddressInput,
} from "@/lib/addressApi";

// types/address.ts
export interface Address {
  id: string;
  userId?: string;

  fullName: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;
  landmark?: string;

  city: string;
  state: string;
  country: string;
  postalCode: string;

  isDefault: boolean;

  createdAt: string; // Prisma returns ISO string
}

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  loading: boolean;

  fetchAddresses: (userId: string) => Promise<void>;

  addAddress: (data: AddressInput) => Promise<Address | null>;

  updateAddress: (id: string, data: Partial<Address>) => Promise<void>;

  deleteAddress: (id: string) => Promise<void>;

  setDefaultAddress: (userId: string, addressId: string) => Promise<void>;

  selectAddress: (id: string) => void;

  clearAddresses: () => void;

  getSelectedAddress: () => Address | null;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,
      loading: false,

      /**
       * Fetch all addresses
       */
      fetchAddresses: async (userId) => {
        try {
          set({ loading: true });

          const addresses = await getAddresses(userId);

          set({
            addresses,
            selectedAddressId:
              addresses.find((a) => a.isDefault)?.id ||
              addresses[0]?.id ||
              null,
          });
        } catch (error) {
          console.error("Fetch addresses failed:", error);
        } finally {
          set({ loading: false });
        }
      },

      /**
       * Create address
       */
      addAddress: async (data) => {
        try {
          const address = await createAddress(data);

          const state = get();

          set({
            addresses: [...state.addresses, address],
            selectedAddressId: state.selectedAddressId || address.id,
          });

          return address;
        } catch (error) {
          console.error("Create address failed:", error);
          return null;
        }
      },

      /**
       * Update address
       */
      updateAddress: async (id, data: UpdateAddressInput) => {
  try {
    const updatedAddress = await updateAddressApi(id, data);

    const state = get();

    set({
      addresses: state.addresses.map((address) =>
        address.id === id ? updatedAddress : address,
      ),
    });
  } catch (error) {
    console.error("Update address failed:", error);
  }
},

      /**
       * Delete address
       */
      deleteAddress: async (id) => {
        try {
          await deleteAddressApi(id);

          const state = get();

          const addresses = state.addresses.filter(
            (address) => address.id !== id,
          );

          set({
            addresses,
            selectedAddressId:
              state.selectedAddressId === id
                ? addresses[0]?.id || null
                : state.selectedAddressId,
          });
        } catch (error) {
          console.error("Delete address failed:", error);
        }
      },

      /**
       * Set default address
       */
      setDefaultAddress: async (userId, addressId) => {
        try {
          await setDefaultAddressApi(userId, addressId);

          const state = get();

          set({
            addresses: state.addresses.map((address) => ({
              ...address,
              isDefault: address.id === addressId,
            })),
            selectedAddressId: addressId,
          });
        } catch (error) {
          console.error("Set default address failed:", error);
        }
      },

      /**
       * Select for checkout
       */
      selectAddress: (id) => {
        set({
          selectedAddressId: id,
        });
      },

      /**
       * Logout cleanup
       */
      clearAddresses: () => {
        set({
          addresses: [],
          selectedAddressId: null,
        });
      },

      /**
       * Selected address
       */
      getSelectedAddress: () => {
        const state = get();

        return (
          state.addresses.find(
            (address) => address.id === state.selectedAddressId,
          ) || null
        );
      },
    }),
    {
      name: "address-storage",
    },
  ),
);

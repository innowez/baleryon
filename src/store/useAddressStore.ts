import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: number;
}

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  addAddress: (address: Omit<Address, "id" | "createdAt">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getSelectedAddress: () => Address | null;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,

      addAddress: (address) => {
        const newAddress: Address = {
          ...address,
          id: `addr-${Date.now()}`,
          createdAt: Date.now(),
        };

        const state = get();
        set({
          addresses: [...state.addresses, newAddress],
          selectedAddressId: state.selectedAddressId || newAddress.id,
        });
      },

      updateAddress: (id, updates) => {
        const state = get();
        set({
          addresses: state.addresses.map((addr) =>
            addr.id === id ? { ...addr, ...updates } : addr
          ),
        });
      },

      deleteAddress: (id) => {
        const state = get();
        const newAddresses = state.addresses.filter((addr) => addr.id !== id);
        set({
          addresses: newAddresses,
          selectedAddressId:
            state.selectedAddressId === id
              ? newAddresses[0]?.id || null
              : state.selectedAddressId,
        });
      },

      selectAddress: (id) => {
        set({ selectedAddressId: id });
      },

      setDefaultAddress: (id) => {
        const state = get();
        set({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          })),
        });
      },

      getSelectedAddress: () => {
        const state = get();
        return (
          state.addresses.find((addr) => addr.id === state.selectedAddressId) ||
          null
        );
      },
    }),
    {
      name: "address-storage",
    }
  )
);

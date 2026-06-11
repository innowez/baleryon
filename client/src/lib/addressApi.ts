// lib/addressApi.ts

import { apiFetch, apiPost } from "./api";

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

  createdAt: string;
}

export type AddressInput = {
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<Omit<AddressInput, "userId">>;

/**
 * CREATE ADDRESS
 */
export const createAddress = async (data: AddressInput): Promise<Address> => {
  return apiPost<Address>("/api/addresses", data);
};

/**
 * GET ALL ADDRESSES OF USER
 */
export const getAddresses = async (userId: string): Promise<Address[]> => {
  return apiFetch<Address[]>(`/api/addresses/${userId}`);
};

/**
 * GET SINGLE ADDRESS
 */
export const getAddressById = async (addressId: string): Promise<Address> => {
  return apiFetch<Address>(`/api/addresses/address/${addressId}`);
};

/**
 * UPDATE ADDRESS
 */
export const updateAddress = async (
  addressId: string,
  data: UpdateAddressInput,
): Promise<Address> => {
  return apiFetch<Address>(`/api/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE ADDRESS
 */
export const deleteAddress = async (
  addressId: string,
): Promise<{ success: boolean }> => {
  return apiFetch<{ success: boolean }>(`/api/addresses/${addressId}`, {
    method: "DELETE",
  });
};

/**
 * SET DEFAULT ADDRESS
 */
export const setDefaultAddress = async (
  userId: string,
  addressId: string,
): Promise<Address> => {
  return apiFetch<Address>(`/api/addresses/${addressId}/default`, {
    method: "PATCH",
    body: JSON.stringify({
      userId,
    }),
  });
};

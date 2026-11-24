
import { useAuthStore } from "@/store/useAuthStore";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "";

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
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<
  Omit<AddressInput, "userId">
>;

type ApiResponse<T> =
  | T
  | {
      success: boolean;
      message?: string;
      data: T;
    };

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new Error(
      "Please log in to access saved addresses."
    );
  }

  const response = await fetch(
    `${API_URL}/api/addresses${path}`,
    {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    }
  );

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.message ??
        `Address request failed (${response.status})`
    );
  }

  if (
    json &&
    typeof json === "object" &&
    "success" in json &&
    "data" in json
  ) {
    return json.data as T;
  }

  return json as T;
}

// CREATE ADDRESS
export const createAddress = (
  data: AddressInput
): Promise<Address> =>
  request<Address>("/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// GET ALL ADDRESSES
// userId is optional for compatibility with old callers.
// Backend determines user from JWT, not this argument.
export const getAddresses = (
  _userId?: string
): Promise<Address[]> =>
  request<Address[]>("/");

// GET SINGLE ADDRESS
export const getAddressById = (
  addressId: string
): Promise<Address> =>
  request<Address>(
    `/${encodeURIComponent(addressId)}`
  );

// UPDATE ADDRESS
export const updateAddress = (
  addressId: string,
  data: UpdateAddressInput
): Promise<Address> =>
  request<Address>(
    `/${encodeURIComponent(addressId)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

// DELETE ADDRESS
export const deleteAddress = (
  addressId: string
): Promise<{ success: boolean }> =>
  request<{ success: boolean }>(
    `/${encodeURIComponent(addressId)}`,
    { method: "DELETE" }
  );

// SET DEFAULT ADDRESS
export const setDefaultAddress = (
  _userId: string,
  addressId: string
): Promise<Address> =>
  request<Address>(
    `/${encodeURIComponent(addressId)}/default`,
    { method: "PATCH" }
  );

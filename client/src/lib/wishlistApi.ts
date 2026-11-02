import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface WishlistItem {
  productId: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  addedAt: number;
}

type WishlistResponse = {
  items: WishlistItem[];
};

// Use the same authentication strategy as cartApi.ts.
// Cookie auth works through credentials: "include".
// Add your existing Authorization header here if using JWT.

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}


async function request(
  path: string,
  init?: RequestInit,
): Promise<WishlistResponse> {
  const url = `${API_URL}/api/wishlist${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the wishlist API. Check backend and CORS.",
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ?? `Wishlist request failed (HTTP ${response.status})`,
    );
  }

  return data as WishlistResponse;
}

export const wishlistApi = {
  get: () => request("/"),

  add: (productId: string) =>
    request("/", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),

  remove: (productId: string) =>
    request(`/${encodeURIComponent(productId)}`, { method: "DELETE" }),

  clear: () =>
    request("/", {
      method: "DELETE",
    }),
};

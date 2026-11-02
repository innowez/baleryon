import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type CartItem = {
  id: string;
  productId: string;
  variantId?: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  stock?: number;
  needsSize?: boolean;
  needsColor?: boolean;
};

export type CartResult = {
  items: CartItem[];
};

export type StockResult = {
  items: Array<{
    productId: string | null;
    size: string | null;
    color: string | null;
    variantId: string | null;
    found: boolean;
    stock: number;
    needsSize: boolean;
    needsColor: boolean;
    sizes: string[];
    colors: Array<{
      name: string;
      hex: string | null;
    }>;
  }>;
};

export class CartApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "CartApiError";
  }
}

// For cookie authentication, credentials: "include" handles cookies.
// For Bearer token authentication, provide your token here.

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}


async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${API_URL}/api/cart${path}`;

  let res: Response;

  try {
    res = await fetch(url, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...init?.headers,
      },
    });
  } catch (error) {
    console.error("Cart API connection failed:", {
      url,
      error,
    });

    throw new CartApiError(
      `Cannot connect to cart API at ${url}. Check backend, port and CORS.`,
      0
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new CartApiError(
      data.message ??
        `Cart request failed (HTTP ${res.status})`,
      res.status
    );
  }

  return data as T;
}

export const cartApi = {
  checkStock: (
    items: Array<
      Pick<CartItem, "productId" | "size" | "color">
    >
  ) =>
    request<StockResult>("/check-stock", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),

  get: () => request<CartResult>("/"),

  add: (item: {
    productId: string;
    size?: string;
    color?: string;
    quantity: number;
  }) =>
    request<CartResult>("/items", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  update: (id: string, quantity: number) =>
    request<CartResult>(
      `/items/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      }
    ),

  remove: (id: string) =>
    request<CartResult>(
      `/items/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    ),

  clear: () =>
    request<CartResult>("/", {
      method: "DELETE",
    }),
};

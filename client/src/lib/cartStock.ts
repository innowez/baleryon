import type { CartItem } from "@/lib/cartApi";

interface StockInfo {
  found: boolean;
  needsSize: boolean;
  needsColor: boolean;
  stock: number;
  variantId?: string | null;
  price?: number;
}

type StockMap = Record<string, StockInfo>;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const stockKey = (item: {
  productId: string;
  size?: string;
  color?: string;
}) =>
  `${item.productId}_${item.size ?? ""}_${item.color ?? ""}`;

export async function fetchStock(
  items: Array<{
    productId: string;
    size?: string;
    color?: string;
  }>
): Promise<StockMap> {
  const response = await fetch(`${API_URL}/api/cart/check-stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to check stock.");
  }

  return data.items ?? {};
}

export function selectionMessage(
  info: StockInfo,
  item: CartItem
): string {
  if (info.needsSize && !item.size) {
    return "Please select a size before continuing.";
  }

  if (info.needsColor && !item.color) {
    return "Please select a color before continuing.";
  }

  return "This product option is unavailable.";
}

export function stockMessage(
  stock: number,
  quantity: number
): string | null {
  if (stock <= 0) {
    return "This item is currently out of stock.";
  }

  if (quantity > stock) {
    return `Only ${stock} item(s) available.`;
  }

  return null;
}

export function resolveStock(
  info: StockInfo | undefined,
  item: CartItem
): number | undefined {
  if (!info) return item.stock;

  const missing =
    (info.needsSize && !item.size) ||
    (info.needsColor && !item.color);

  if (missing || !info.found) return undefined;

  return info.stock;
}
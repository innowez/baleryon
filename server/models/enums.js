/** Domain enums — mirror Prisma schema for use without importing @prisma/client */

export const AuthProvider = {
  LOCAL: "local",
  GOOGLE: "google",
  FACEBOOK: "facebook",
};

export const PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
};

export const CouponType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
};

export const InventoryLogType = {
  PURCHASE: "PURCHASE",
  SALE: "SALE",
  RETURN: "RETURN",
  DAMAGE: "DAMAGE",
  ADJUSTMENT: "ADJUSTMENT",
};

export const ReturnStatus = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REFUNDED: "REFUNDED",
  COMPLETED: "COMPLETED",
};

export const AnalyticsEventName = {
  PRODUCT_VIEW: "PRODUCT_VIEW",
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_CART: "REMOVE_CART",
  CHECKOUT_STARTED: "CHECKOUT_STARTED",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
};

/** Suggested initial categories for Baleryon */
export const INITIAL_CATEGORIES = [
  { name: "Oversized Tees", slug: "oversized-tees" },
  { name: "Anime Tees", slug: "anime-tees" },
  { name: "Dragon Collection", slug: "dragon-collection" },
  { name: "Game Of Thrones", slug: "game-of-thrones" },
  { name: "Hoodies", slug: "hoodies" },
  { name: "Streetwear", slug: "streetwear" },
];

export const INITIAL_ROLES = ["admin", "customer", "staff"];

import { apiPost } from "@/lib/api";

export type PaymentMethod = "razorpay" | "cod";

export interface CreateOrderPayload {
  userId?: string | null;
  guest?: boolean;
  addressId: string;
  items: {
    id: string;
    productId?: string | null;
    variantId?: string | null;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
  discountAmount: number | null;
}

export interface CreateOrderResponse {
  order: {
    id: string;
    orderNumber: string;
    totalAmount: string | number | null;
    paymentMethod?: string | null;
    paymentStatus?: string;
  };
  razorpayOrder?: {
    id: string;
    amount: number;
  } | null;
  message?: string;
}

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> => {
  return apiPost<CreateOrderResponse>(
    "/api/orders/create-order",
    payload as unknown as Record<string, unknown>,
  );
};

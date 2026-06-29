import { apiPost } from "@/lib/api";

export interface CreateOrderPayload {
  userId?: string | null;
  guest?: boolean;
  addressId: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  couponCode: string | null;
  discountAmount: number | null;
}
export interface CreateOrderResponse {
  orderId: string;
  razorpayOrder?: {
    id: string;
    amount: number;
  } | null;
}

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> => {
  return apiPost<CreateOrderResponse>(
    "/api/orders/create-order",
    payload as unknown as Record<string, unknown>,
  );
};

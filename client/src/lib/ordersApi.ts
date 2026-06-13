import { apiFetch } from "@/lib/api";
import type {
  OrderTrackingResponse,
  UserOrdersResponse,
} from "@/types/order";

export async function fetchUserOrders(userId: string) {
  return apiFetch<UserOrdersResponse>(
    `/api/viewOrders/user/${userId}/orders`
  );
}

export async function fetchOrderTracking(orderId: string) {
  return apiFetch<OrderTrackingResponse>(
    `/api/viewOrders/tracking/${orderId}`
  );
}
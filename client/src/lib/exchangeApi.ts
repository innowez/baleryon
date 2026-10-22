// lib/exchangeApi.ts

import { apiFetch } from "./api";
import type { ExchangeEligibility, ExchangeRequest } from "@/types/exchange";

export function fetchExchangeOptions(orderItemId: string, userId: string) {
  return apiFetch<ExchangeEligibility>(
    `/api/exchange/options/${orderItemId}?userId=${encodeURIComponent(userId)}`,
  );
}

export function createExchangeRequest(data: {
  userId: string;
  orderItemId: string;
  desiredVariantId: string;
  reason?: string;
}) {
  return apiFetch<{ success: boolean; exchangeRequest: ExchangeRequest }>(
    "/api/exchange",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function fetchOrderExchangeRequests(orderId: string) {
  return apiFetch<{ success: boolean; exchangeRequests: ExchangeRequest[] }>(
    `/api/exchange/order/${orderId}`,
  );
}

// types/exchange.ts

export interface ExchangeVariantOption {
  id: string;
  color?: string | null;
  size?: string | null;
  stock: number;
}

export interface ExchangeEligibility {
  success: boolean;
  eligible: boolean;
  message: string | null;
  windowDays: number;
  deliveredAt: string | null;
  expiresAt: string | null;
  currentVariant: {
    id: string;
    color?: string | null;
    size?: string | null;
  } | null;
  variants: ExchangeVariantOption[];
}

export type ExchangeStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "REFUNDED"
  | "COMPLETED";

export interface ExchangeRequest {
  id: string;
  orderItemId: string;
  type: string;
  reason: string | null;
  status: ExchangeStatus;
  desiredVariantId: string | null;
  adminNote: string | null;
  createdAt: string;
  respondedAt: string | null;
  desiredVariant?: {
    id: string;
    color?: string | null;
    size?: string | null;
  } | null;
}

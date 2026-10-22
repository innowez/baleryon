"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { ExchangeModal } from "./ExchangeModal";
import type { OrderItem } from "@/types/order";
import type { ExchangeRequest } from "@/types/exchange";

interface Props {
  item: OrderItem;
  userId: string;
  exchangeRequest?: ExchangeRequest | null;
  onChanged: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Exchange Requested",
  APPROVED: "Exchange Approved",
  REJECTED: "Exchange Cancelled",
  COMPLETED: "Exchange Completed",
  REFUNDED: "Refunded",
};

export function OrderProductExchangeRow({
  item,
  userId,
  exchangeRequest,
  onChanged,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!item.id || !userId) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAFAFA] border border-[#F1F1F1]">
        <div className="min-w-0">
          <h4 className="font-medium text-[#0F0F0F] truncate">
            {item.productName}
          </h4>

          {exchangeRequest ? (
            <div className="mt-1.5 space-y-1">
              <span
                className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  STATUS_STYLE[exchangeRequest.status] ?? "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {STATUS_LABEL[exchangeRequest.status] ?? exchangeRequest.status}
              </span>

              {exchangeRequest.desiredVariant && (
                <p className="text-xs text-[#6B7280]">
                  New:{" "}
                  {[exchangeRequest.desiredVariant.color, exchangeRequest.desiredVariant.size]
                    .filter(Boolean)
                    .join(" / ") || "—"}
                </p>
              )}

              {exchangeRequest.status === "REJECTED" && exchangeRequest.adminNote && (
                <p className="text-xs text-red-600">
                  Reason: {exchangeRequest.adminNote}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#6B7280] mt-1">Not exchanged</p>
          )}
        </div>

        {!exchangeRequest && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] transition"
          >
            <RefreshCw size={14} />
            <span className="text-sm font-medium">Request Exchange</span>
          </button>
        )}
      </div>

      {open && (
        <ExchangeModal
          orderItemId={item.id}
          userId={userId}
          productTitle={item.productName || item.product?.title || "This item"}
          onClose={() => setOpen(false)}
          onSuccess={onChanged}
        />
      )}
    </>
  );
}

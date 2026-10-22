"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import {
  fetchExchangeOptions,
  createExchangeRequest,
} from "@/lib/exchangeApi";
import type { ExchangeEligibility } from "@/types/exchange";
import Loader from "@/components/ui/Loader";

interface Props {
  orderItemId: string;
  userId: string;
  productTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExchangeModal({
  orderItemId,
  userId,
  productTitle,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<ExchangeEligibility | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchExchangeOptions(orderItemId, userId)
      .then((data) => {
        if (cancelled) return;
        setEligibility(data);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Unable to check exchange eligibility right now. Please try again later.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderItemId, userId]);

  async function submit() {
    if (!selectedVariantId || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await createExchangeRequest({
        userId,
        orderItemId,
        desiredVariantId: selectedVariantId,
        reason: reason.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit the exchange request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg p-6"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="font-bold text-xl">Request Exchange</h2>
            <p className="text-sm text-[#6B7280] mt-1 truncate max-w-xs">
              {productTitle}
            </p>
          </div>

          <button onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader size={32} />
          </div>
        ) : !eligibility?.eligible ? (
          <div className="text-center py-6">
            <p className="text-sm text-[#6B7280]">
              {eligibility?.message ||
                error ||
                "This item isn't eligible for exchange right now."}
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full border border-[#E5E5E5] rounded-xl py-3 text-sm font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {eligibility.currentVariant && (
              <p className="text-xs text-[#6B7280] mb-4">
                Currently:{" "}
                <span className="font-medium text-[#0F0F0F]">
                  {[eligibility.currentVariant.color, eligibility.currentVariant.size]
                    .filter(Boolean)
                    .join(" / ") || "—"}
                </span>
              </p>
            )}

            {eligibility.variants.length === 0 ? (
              <p className="text-sm text-[#6B7280] py-4 text-center">
                No other sizes/colors are in stock for this product right now.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-5">
                {eligibility.variants.map((v) => {
                  const label = [v.color, v.size].filter(Boolean).join(" / ") || "Option";
                  const active = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`rounded-xl border px-3 py-2.5 text-sm text-left transition-colors ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-[#E5E5E5] hover:bg-[#F8F8F8]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Reason (optional) — e.g. runs small"
              className="w-full border rounded-xl p-3 text-sm"
            />

            {error && (
              <p className="text-xs text-red-600 mt-2">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={!selectedVariantId || submitting}
              className="w-full mt-5 bg-black text-white rounded-xl py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader size={16} />
              ) : (
                <>
                  <RefreshCw size={14} />
                  Submit Exchange Request
                </>
              )}
            </button>

            <p className="text-[10px] text-[#9CA3AF] mt-3 text-center">
              You can request an exchange once per item, within{" "}
              {eligibility.windowDays} days of delivery.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

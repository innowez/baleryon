"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { apiPost } from "@/lib/api";

interface CouponResponse {
  valid: boolean;
  message: string;
  code?: string;
  discount?: number;
  couponId?: string;
}

interface Props {
  subtotal: number;
  onApply: (discount: number, code: string) => void;
}

export default function CouponChecker({ subtotal, onApply }: Props) {
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<"idle" | "success" | "failed">("idle");

  const [message, setMessage] = useState("");

  const handleApply = async () => {
    try {
      setLoading(true);

      const response = await apiPost<CouponResponse>("/api/coupons/validate", {
        method: "POST",
        body: {
          code,
          subtotal,
        },
      });

      if (response.valid) {
        setResult("success");

        setMessage(
          `₹${Number(response.discount ?? 0).toFixed(2)} discount applied`,
        );

        onApply(response.discount ?? 0, response.code ?? "");
      } else {
        setResult("failed");

        setMessage(response.message);
      }
    } catch (error) {
      console.error(error);

      setResult("failed");

      setMessage("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCode("");
    setResult("idle");
    setMessage("");
  };

  return (
    <div className="rounded-2xl bg-[#F5F5F5] p-4 space-y-4">
      <div>
        <h3 className="font-semibold">Apply Coupon</h3>

        <p className="text-xs text-[#6B7280]">Enter coupon code</p>
      </div>

      {result === "idle" ? (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Coupon Code"
            className="flex-1 rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm"
          />

          <button
            onClick={handleApply}
            disabled={!code || loading}
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`rounded-lg border p-4 ${
              result === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex gap-3">
              {result === "success" ? (
                <Check className="text-green-600" />
              ) : (
                <X className="text-red-600" />
              )}

              <p>{message}</p>
            </div>
          </div>

          <button onClick={reset} className="text-xs underline">
            Use another coupon
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function DeliveryChecker() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<"idle" | "found" | "not-found">("idle");

  const [deliveryInfo, setDeliveryInfo] = useState("");

  interface DeliveryResponse {
    available: boolean;
    city?: string;
    state?: string;
    estimatedDays?: string;
    message?: string;
  }

  const handleCheck = async () => {
    if (pincode.length !== 6) return;

    try {
      setLoading(true);

      const data = await apiFetch<DeliveryResponse>(
        `/api/delivery/check/${pincode}`,
      );

      if (data.available) {
        setResult("found");

        setDeliveryInfo(`${data.city}, ${data.state} • Delivery Available`);
      } else {
        setResult("not-found");

        setDeliveryInfo(data.message || "Delivery not available");
      }
    } catch (error) {
      console.error(error);

      setResult("not-found");

      setDeliveryInfo("Unable to check delivery availability");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPincode("");
    setResult("idle");
    setDeliveryInfo("");
  };

  return (
    <div className="rounded-2xl bg-[#F5F5F5] p-4 sm:p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#0F0F0F]">Check Delivery</h3>

        <p className="mt-1 text-xs text-[#6B7280]">
          Enter your pincode to check delivery availability
        </p>
      </div>

      {result === "idle" ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={pincode}
            onChange={(e) =>
              setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            disabled={loading}
            className="flex-1 rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm focus:border-black focus:outline-none"
          />

          <button
            onClick={handleCheck}
            disabled={loading || pincode.length !== 6}
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Check"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`rounded-lg border p-4 ${
              result === "found"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {result === "found" ? (
                <Check size={20} className="mt-0.5 text-green-600" />
              ) : (
                <X size={20} className="mt-0.5 text-red-600" />
              )}

              <div>
                <p
                  className={`font-semibold ${
                    result === "found" ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {deliveryInfo}
                </p>

                {result === "found" && (
                  <p className="mt-1 text-xs text-green-700">
                    Estimated delivery within 2–5 business days
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-600">
                  Free shipping on orders above ₹999
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="text-xs font-semibold text-black underline"
          >
            Check another pincode
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Check, X } from "lucide-react";

const MOCK_PINCODES: Record<string, string> = {
  "400001": "Mumbai — Delivered by Tomorrow",
  "400002": "Mumbai — Delivered by Tomorrow",
  "110001": "Delhi — Delivered in 2-3 days",
  "110002": "Delhi — Delivered in 2-3 days",
  "560001": "Bangalore — Delivered in 2 days",
  "600001": "Chennai — Delivered in 3 days",
  "700001": "Kolkata — Delivered in 4 days",
};

export default function DeliveryChecker() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"idle" | "found" | "not-found">("idle");
  const [deliveryInfo, setDeliveryInfo] = useState("");

  const handleCheck = () => {
    if (pincode.length !== 6) return;

    setLoading(true);
    setTimeout(() => {
      const info = MOCK_PINCODES[pincode];
      if (info) {
        setResult("found");
        setDeliveryInfo(info);
      } else {
        setResult("not-found");
        setDeliveryInfo("Delivery not available to this pincode");
      }
      setLoading(false);
    }, 800);
  };

  const handleReset = () => {
    setPincode("");
    setResult("idle");
    setDeliveryInfo("");
  };

  return (
    <div className="bg-[#F5F5F5] rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[#0F0F0F]">Check Delivery</p>
        <p className="text-xs text-[#6B7280]">
          Enter your pincode to check delivery availability
        </p>
      </div>

      {result === "idle" ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            className="flex-1 px-3 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#0F0F0F]"
            disabled={loading}
          />
          <button
            onClick={handleCheck}
            disabled={pincode.length !== 6 || loading}
            className="px-4 py-2.5 rounded-lg bg-[#0F0F0F] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Check"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`flex items-start gap-3 p-3 rounded-lg ${
              result === "found"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {result === "found" ? (
              <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <X size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  result === "found" ? "text-green-900" : "text-red-900"
                }`}
              >
                {deliveryInfo}
              </p>
              <p className="text-xs mt-1 text-gray-600">
                Free shipping on orders above ₹999
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-[#0F0F0F] underline hover:no-underline"
          >
            Check another pincode
          </button>
        </div>
      )}
    </div>
  );
}

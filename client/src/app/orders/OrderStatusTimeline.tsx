// components/orders/OrderStatusTimeline.tsx

"use client";

import { Check } from "lucide-react";
import { TrackingStep } from "@/types/order";

interface Props {
  steps: TrackingStep[];
}

export function OrderStatusTimeline({ steps }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6">
      <h2 className="font-semibold text-lg mb-8">
        Order Tracking
      </h2>

      <div className="flex justify-between overflow-x-auto">
        {steps.map((step, index) => (
          <div
            key={step.status}
            className="flex items-center flex-1 min-w-[120px]"
          >
            <div className="flex flex-col items-center">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${
                  step.completed
                    ? "bg-[#0F0F0F] text-white"
                    : "border border-[#D1D5DB] text-[#9CA3AF]"
                }
              `}
              >
                {step.completed ? (
                  <Check size={18} />
                ) : (
                  <span className="text-xs">
                    {index + 1}
                  </span>
                )}
              </div>

              <span
                className={`
                  mt-3 text-xs text-center
                  ${
                    step.current
                      ? "font-semibold text-black"
                      : "text-[#6B7280]"
                  }
                `}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`
                  h-[2px] flex-1 mx-2
                  ${
                    step.completed
                      ? "bg-[#0F0F0F]"
                      : "bg-[#E5E5E5]"
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
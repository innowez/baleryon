"use client";

import { Shield, RotateCcw, Award, Zap } from "lucide-react";

export default function TrustIndicators() {
  const indicators = [
    {
      icon: Shield,
      label: "Secure Payments",
      description: "100% encrypted transactions",
    },
    {
      icon: RotateCcw,
      label: "Easy Returns",
      description: "30-day return policy",
    },
    {
      icon: Award,
      label: "Premium Quality",
      description: "Authentic products",
    },
    {
      icon: Zap,
      label: "Fast Shipping",
      description: "Express delivery available",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {indicators.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5]/50 text-center"
          >
            <Icon size={20} className="text-[#0F0F0F]" />
            <div>
              <p className="text-xs font-semibold text-[#0F0F0F]">
                {item.label}
              </p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

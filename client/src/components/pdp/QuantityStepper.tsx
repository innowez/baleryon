"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (qty: number) => void;
}

export default function QuantityStepper({
  value,
  min = 1,
  max = 10,
  onChange,
}: QuantityStepperProps) {
  const handleDecrease = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrease = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-semibold text-[#0F0F0F]">Quantity</label>
      <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-xl p-1">
        <button
          onClick={handleDecrease}
          disabled={value <= min}
          className="p-2 rounded-lg hover:bg-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={16} className="text-[#6B7280]" />
        </button>
        <span className="w-8 text-center font-semibold text-[#0F0F0F]">
          {value}
        </span>
        <button
          onClick={handleIncrease}
          disabled={value >= max}
          className="p-2 rounded-lg hover:bg-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} className="text-[#6B7280]" />
        </button>
      </div>
    </div>
  );
}

"use client";

interface SizeSelectorProps {
  sizes: string[];
  selected: string;
  onChange: (size: string) => void;
  onOpenGuide: () => void;
}

export default function SizeSelector({
  sizes,
  selected,
  onChange,
  onOpenGuide,
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#0F0F0F]">Size</label>
        {sizes[0] !== "One Size" && (
          <button
            onClick={onOpenGuide}
            className="text-xs font-semibold text-[#0F0F0F] underline hover:no-underline transition-all"
          >
            Size Guide
          </button>
        )}
      </div>

      {sizes[0] === "One Size" ? (
        <div className="py-4 px-3 rounded-xl border border-[#E5E5E5] text-center">
          <p className="text-sm text-[#6B7280] font-medium">One Size</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onChange(size)}
              className={`py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${
                selected === size
                  ? "bg-[#0F0F0F] text-white"
                  : "border border-[#E5E5E5] text-[#6B7280] hover:border-[#0F0F0F]"
              }`}
              aria-pressed={selected === size}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

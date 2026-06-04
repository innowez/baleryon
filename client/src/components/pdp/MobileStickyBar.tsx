"use client";

interface MobileStickyBarProps {
  price: number;
  onAddToCart: () => void;
}

export default function MobileStickyBar({
  price,
  onAddToCart,
}: MobileStickyBarProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 md:hidden bg-white border-t border-[#E5E5E5] h-16 flex items-center px-4 gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex-1">
        <p className="text-[11px] text-[#6B7280] font-medium">Price</p>
        <p className="text-lg font-bold text-[#0F0F0F]">
          ₹{price.toLocaleString()}
        </p>
      </div>
      <button
        onClick={onAddToCart}
        className="button-primary flex-1 py-3 text-sm h-auto"
      >
        Add to Cart
      </button>
    </div>
  );
}

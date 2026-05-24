"use client";

import { X } from "lucide-react";

type FilterState = {
  categories: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  colors: string[];
  sizes: string[];
};

type ActiveFiltersProps = {
  filters: FilterState;
  search: string;
  resultCount: number;
  onRemoveFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onRemoveSearch: () => void;
  onClearAll: () => void;
};

export function ActiveFilters({
  filters,
  search,
  resultCount,
  onRemoveFilter,
  onRemoveSearch,
  onClearAll,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceMin !== 0 ||
    filters.priceMax !== 3999 ||
    filters.rating > 0 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    search.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#6B7280]">
          Showing {resultCount} {resultCount === 1 ? "product" : "products"}
        </span>
        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-[#FF3B30] hover:text-[#FF3B30]/80 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Search chip */}
        {search && (
          <button
            onClick={onRemoveSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-xs font-medium hover:bg-[#E5E5E5] transition-colors group"
          >
            <span>Search: "{search}"</span>
            <X size={14} className="text-[#6B7280] group-hover:text-[#0F0F0F]" />
          </button>
        )}

        {/* Category chips */}
        {filters.categories.map((category) => (
          <button
            key={category}
            onClick={() => onRemoveFilter("categories", filters.categories.filter((c) => c !== category))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-xs font-medium hover:bg-[#E5E5E5] transition-colors group"
          >
            <span>{category}</span>
            <X size={14} className="text-[#6B7280] group-hover:text-[#0F0F0F]" />
          </button>
        ))}

        {/* Price chip */}
        {(filters.priceMin !== 0 || filters.priceMax !== 3999) && (
          <button
            onClick={() => {
              onRemoveFilter("priceMin", 0);
              onRemoveFilter("priceMax", 3999);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-xs font-medium hover:bg-[#E5E5E5] transition-colors group"
          >
            <span>₹{filters.priceMin.toLocaleString()} – ₹{filters.priceMax.toLocaleString()}</span>
            <X size={14} className="text-[#6B7280] group-hover:text-[#0F0F0F]" />
          </button>
        )}

        {/* Rating chip */}
        {filters.rating > 0 && (
          <button
            onClick={() => onRemoveFilter("rating", 0)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-xs font-medium hover:bg-[#E5E5E5] transition-colors group"
          >
            <span>{filters.rating}+ stars</span>
            <X size={14} className="text-[#6B7280] group-hover:text-[#0F0F0F]" />
          </button>
        )}

        {/* Color chips */}
        {filters.colors.map((color) => (
          <button
            key={color}
            onClick={() => onRemoveFilter("colors", filters.colors.filter((c) => c !== color))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-xs font-medium hover:bg-[#E5E5E5] transition-colors group"
          >
            <span>{color}</span>
            <X size={14} className="text-[#6B7280] group-hover:text-[#0F0F0F]" />
          </button>
        ))}

        {/* Size chips */}
        {filters.sizes.map((size) => (
          <button
            key={size}
            onClick={() => onRemoveFilter("sizes", filters.sizes.filter((s) => s !== size))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-xs font-medium hover:bg-[#E5E5E5] transition-colors group"
          >
            <span>Size: {size}</span>
            <X size={14} className="text-[#6B7280] group-hover:text-[#0F0F0F]" />
          </button>
        ))}
      </div>
    </div>
  );
}

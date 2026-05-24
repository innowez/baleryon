"use client";

import { ChevronDown } from "lucide-react";

type SortOption = "relevance" | "price-asc" | "price-desc" | "newest" | "best-rated" | "popularity";

type SortDropdownProps = {
  sort: SortOption;
  onChange: (sort: SortOption) => void;
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-rated", label: "Best Rated" },
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
];

export function SortDropdown({ sort, onChange }: SortDropdownProps) {
  return (
    <div className="relative">
      <select
        value={sort}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-[#E5E5E5] bg-white text-sm font-medium focus:outline-none focus:border-[#0F0F0F] focus:ring-2 focus:ring-[#0F0F0F]/10 transition-all cursor-pointer pr-10"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
      />
    </div>
  );
}

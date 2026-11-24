
"use client";

import { Search, X } from "lucide-react";

type SearchBarProps = {
  search: string;
  onChange: (query: string) => void;
};

export function SearchBar({
  search,
  onChange,
}: SearchBarProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative mb-6" role="search">
      <Search
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
      />

      <input
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={(event) =>
          onChange(event.target.value)
        }
        autoComplete="off"
        spellCheck={false}
        aria-label="Search products"
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:border-[#0F0F0F] focus:ring-2 focus:ring-[#0F0F0F]/10 transition-all text-sm [&::-webkit-search-cancel-button]:hidden"
      />

      {search.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0F0F0F] transition-colors touch-manipulation"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

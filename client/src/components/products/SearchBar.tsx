"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

type SearchBarProps = {
  search: string;
  onChange: (query: string) => void;
};

export function SearchBar({ search, onChange }: SearchBarProps) {
  const [input, setInput] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(input);
    }, 300);

    return () => clearTimeout(timer);
  }, [input, onChange]);

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
      <input
        type="text"
        placeholder="Search products..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:border-[#0F0F0F] focus:ring-2 focus:ring-[#0F0F0F]/10 transition-all text-sm"
      />
      {input && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0F0F0F] transition-colors touch-manipulation"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

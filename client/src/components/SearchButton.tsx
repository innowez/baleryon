"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  dark: boolean;
}

export function SearchBar({ dark }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative flex items-center">
      {/* Expanding input — grows to the left */}
      <div
        className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "w-48 sm:w-64 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          className={`w-full text-sm outline-none bg-transparent placeholder:text-current/50 pr-2 ${
            dark ? "text-[#0F0F0F]" : "text-white"
          }`}
        />
        {/* Right border line */}
        <div
          className={`w-px h-4 flex-shrink-0 mr-1 ${
            dark ? "bg-[#0F0F0F]/20" : "bg-white/30"
          }`}
        />
      </div>

      {/* Icon button toggles between Search and X */}
      <button
        aria-label={open ? "Close search" : "Search"}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative z-10 p-2.5 rounded-xl transition-colors touch-manipulation flex-shrink-0 ${
          dark
            ? "hover:bg-[#F5F5F5] text-[#0F0F0F]"
            : "hover:bg-white/20 text-white"
        }`}
      >
        <Search
          size={20}
          strokeWidth={1.8}
          className={`absolute transition-all duration-200 ${
            open ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
          }`}
        />
        <X
          size={20}
          strokeWidth={1.8}
          className={`transition-all duration-200 ${
            open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
          }`}
        />
      </button>

      {/* Underline — only visible when open */}
      <div
        className={`absolute bottom-0 left-0 right-10 h-px transition-all duration-300 ${
          open ? "opacity-100" : "opacity-0"
        } ${dark ? "bg-[#0F0F0F]/30" : "bg-white/40"}`}
      />
    </div>
  );
}
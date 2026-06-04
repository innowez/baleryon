"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1);

      if (currentPage > 3) {
        buttons.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!buttons.includes(i)) {
          buttons.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        buttons.push("...");
      }

      buttons.push(totalPages);
    }

    return buttons;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2.5 rounded-lg border border-[#E5E5E5] font-semibold text-sm hover:bg-[#F5F5F5] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {renderPageButtons().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`w-9 h-9 rounded-lg font-semibold text-sm transition-all touch-manipulation ${
              page === currentPage
                ? "bg-[#0F0F0F] text-white"
                : page === "..."
                ? "cursor-default text-[#6B7280]"
                : "border border-[#E5E5E5] hover:bg-[#F5F5F5] active:scale-95"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2.5 rounded-lg border border-[#E5E5E5] font-semibold text-sm hover:bg-[#F5F5F5] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

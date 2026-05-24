"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { FilterPanel } from "./FilterPanel";

type FilterState = {
  categories: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  colors: string[];
  sizes: string[];
};

type FilterDrawerProps = {
  filters: FilterState;
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resultCount: number;
  onClose: () => void;
};

export function FilterDrawer({ filters, onChange, resultCount, onClose }: FilterDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white border-b border-[#E5E5E5]">
          <div className="w-10 h-1 bg-[#E5E5E5] rounded-full" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-6">Filters</h2>
          <FilterPanel filters={filters} onChange={onChange} />
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] p-4 sm:p-6">
          <button
            onClick={onClose}
            className="button-primary w-full"
          >
            Show {resultCount} {resultCount === 1 ? "result" : "results"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

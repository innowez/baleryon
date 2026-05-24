"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { categories } from "@/data/products";

type FilterState = {
  categories: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  colors: string[];
  sizes: string[];
};

type FilterPanelProps = {
  filters: FilterState;
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
};

const COLOR_MAP: Record<string, string> = {
  Black: "#0F0F0F",
  White: "#FFFFFF",
  Gray: "#9CA3AF",
  Navy: "#1E3A5F",
  Khaki: "#C3B091",
  Olive: "#6B7246",
  Charcoal: "#36454F",
  Brown: "#7C3F00",
  Red: "#FF3B30",
  Cream: "#FFFDD0",
  "Light Blue": "#ADD8E6",
  "Medium Blue": "#4682B4",
  "Dark Blue": "#00008B",
  Tan: "#D2B48C",
};

const ALL_COLORS = Object.keys(COLOR_MAP);
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "6", "7", "8", "9", "10", "11", "12", "13", "Small", "Medium", "Large", "One Size"];

type SectionKey = "category" | "price" | "rating" | "color" | "size";

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    category: true,
    price: true,
    rating: false,
    color: false,
    size: false,
  });

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (cat: string) => {
    const newCategories = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange("categories", newCategories);
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onChange("colors", newColors);
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange("sizes", newSizes);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="border-b border-[#E5E5E5] pb-6">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Category</h3>
          <ChevronDown
            size={16}
            className={`transition-transform ${expandedSections.category ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.category && (
          <div className="space-y-2.5">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  className="w-4 h-4 rounded border-[1.5px] border-[#E5E5E5] cursor-pointer accent-[#0F0F0F]"
                />
                <span className="text-sm text-[#6B7280] group-hover:text-[#0F0F0F] transition-colors">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="border-b border-[#E5E5E5] pb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Price</h3>
          <ChevronDown
            size={16}
            className={`transition-transform ${expandedSections.price ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-[#6B7280] mb-1.5 block">Min</label>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => onChange("priceMin", parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#0F0F0F] focus:ring-1 focus:ring-[#0F0F0F]"
                  min="0"
                  max="3999"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[#6B7280] mb-1.5 block">Max</label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => onChange("priceMax", parseInt(e.target.value) || 3999)}
                  className="w-full px-2.5 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#0F0F0F] focus:ring-1 focus:ring-[#0F0F0F]"
                  min="0"
                  max="3999"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b border-[#E5E5E5] pb-6">
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Rating</h3>
          <ChevronDown
            size={16}
            className={`transition-transform ${expandedSections.rating ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.rating && (
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => onChange("rating", filters.rating === stars ? 0 : stars)}
                className={`w-full text-left px-2.5 py-2 rounded-lg transition-all ${
                  filters.rating === stars
                    ? "bg-[#0F0F0F] text-white"
                    : "hover:bg-[#F5F5F5] text-[#6B7280]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs">
                        {i < stars ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-medium">{stars}+ Stars</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Filter */}
      <div className="border-b border-[#E5E5E5] pb-6">
        <button
          onClick={() => toggleSection("color")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Color</h3>
          <ChevronDown
            size={16}
            className={`transition-transform ${expandedSections.color ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.color && (
          <div className="grid grid-cols-4 gap-2.5">
            {ALL_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`w-8 h-8 rounded-full transition-all ${
                  filters.colors.includes(color)
                    ? "ring-2 ring-[#0F0F0F] ring-offset-2"
                    : "ring-1 ring-[#E5E5E5]"
                }`}
                style={{ backgroundColor: COLOR_MAP[color] }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Size Filter */}
      <div>
        <button
          onClick={() => toggleSection("size")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Size</h3>
          <ChevronDown
            size={16}
            className={`transition-transform ${expandedSections.size ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.size && (
          <div className="grid grid-cols-3 gap-2">
            {ALL_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.sizes.includes(size)
                    ? "bg-[#0F0F0F] text-white"
                    : "border border-[#E5E5E5] text-[#6B7280] hover:border-[#0F0F0F]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

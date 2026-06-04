"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  category: string;
  onClose: () => void;
}

const CATEGORY_GUIDES: Record<
  string,
  { title: string; headers: string[]; rows: (string | number)[][] }
> = {
  "T-Shirts": {
    title: "T-Shirt Fit Guide",
    headers: ["Size", "Chest (cm)", "Length (cm)", "Sleeve (cm)"],
    rows: [
      ["XS", "78", "66", "17"],
      ["S", "84", "69", "18"],
      ["M", "90", "72", "19"],
      ["L", "96", "75", "20"],
      ["XL", "102", "78", "21"],
      ["XXL", "108", "81", "22"],
    ],
  },
  Shirts: {
    title: "Shirt Fit Guide",
    headers: ["Size", "Chest (cm)", "Length (cm)", "Sleeve (cm)"],
    rows: [
      ["S", "86", "71", "60"],
      ["M", "92", "74", "62"],
      ["L", "98", "77", "64"],
      ["XL", "104", "80", "66"],
      ["XXL", "110", "83", "68"],
    ],
  },
  Bottoms: {
    title: "Bottom Fit Guide (Waist)",
    headers: ["Size", "Waist (cm)", "Length (cm)", "Inseam (cm)"],
    rows: [
      ["28", "71", "100", "76"],
      ["30", "76", "100", "76"],
      ["32", "81", "100", "76"],
      ["34", "86", "100", "76"],
      ["36", "91", "100", "76"],
    ],
  },
  Footwear: {
    title: "Footwear Size Guide",
    headers: ["UK Size", "EU Size", "Foot Length (cm)", "US Size"],
    rows: [
      ["6", "39", "24.5", "7"],
      ["7", "40", "25.1", "8"],
      ["8", "41", "25.7", "9"],
      ["9", "42", "26.3", "10"],
      ["10", "43", "27", "11"],
      ["11", "44", "27.6", "12"],
    ],
  },
  Accessories: {
    title: "One Size Fits All",
    headers: [],
    rows: [],
  },
  Outerwear: {
    title: "Jacket Fit Guide",
    headers: ["Size", "Chest (cm)", "Length (cm)", "Sleeve (cm)"],
    rows: [
      ["XS", "84", "62", "61"],
      ["S", "90", "64", "63"],
      ["M", "96", "66", "65"],
      ["L", "102", "68", "67"],
      ["XL", "108", "70", "69"],
    ],
  },
};

export default function SizeGuideModal({
  category,
  onClose,
}: SizeGuideModalProps) {
  const guide = CATEGORY_GUIDES[category] || CATEGORY_GUIDES["T-Shirts"];
  const isOneSize = guide.rows.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0F0F0F]">{guide.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {isOneSize ? (
            <div className="text-center py-8">
              <p className="text-lg text-[#6B7280]">
                This item comes in one universal size that fits most body types.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E5E5]">
                    {guide.headers.map((header) => (
                      <th
                        key={header}
                        className="text-left py-3 px-2 font-semibold text-[#0F0F0F]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#E5E5E5] hover:bg-[#F5F5F5]"
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="py-3 px-2 text-[#6B7280]"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-[#F5F5F5] rounded-xl">
            <p className="text-sm text-[#6B7280]">
              <span className="font-semibold text-[#0F0F0F]">Size Tip:</span> Measure
              yourself with a soft measuring tape. For the best fit, refer to our
              guide above and compare your measurements with the size chart.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

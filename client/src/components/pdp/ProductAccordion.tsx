"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Product } from "@/types/product";

interface ProductAccordionProps {
  product: Product;
}

export default function ProductAccordion({ product }: ProductAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = [
    {
      id: "details",
      title: "Product Details",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280] leading-relaxed">
            {product.description}
          </p>
          <ul className="text-sm text-[#6B7280] space-y-2 list-disc list-inside">
            <li>Premium quality fabric</li>
            <li>Comfort fit for all-day wear</li>
            <li>Perfect for casual and semi-formal occasions</li>
            <li>Available in multiple colors</li>
          </ul>
        </div>
      ),
    },
    {
      id: "material",
      title: "Material & Care",
      content: (
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-[#0F0F0F] mb-2">
              Fabric Composition
            </h4>
            <p className="text-sm text-[#6B7280]">100% Premium Cotton</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#0F0F0F] mb-2">
              Care Instructions
            </h4>
            <ul className="text-sm text-[#6B7280] space-y-1 list-disc list-inside">
              <li>Gentle machine wash in cold water</li>
              <li>Do not bleach</li>
              <li>Tumble dry on low heat</li>
              <li>Iron on medium heat if needed</li>
              <li>Do not dry clean</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "fit",
      title: "Fit Information",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">
            This product features a <span className="font-semibold text-[#0F0F0F]">comfort fit</span> silhouette
            that works well for most body types.
          </p>
          <div className="bg-[#F5F5F5] rounded-lg p-3">
            <p className="text-xs font-semibold text-[#0F0F0F] mb-2">
              Model Wear
            </p>
            <p className="text-xs text-[#6B7280]">
              Model is 6' tall, wearing size M
            </p>
          </div>
          <p className="text-sm text-[#6B7280]">
            For a precise fit, please refer to our size guide and compare your measurements.
          </p>
        </div>
      ),
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      content: (
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-[#0F0F0F] mb-1">
              Shipping
            </h4>
            <p className="text-sm text-[#6B7280]">
              Free shipping on orders above ₹999. Standard delivery takes 3-5 business days.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#0F0F0F] mb-1">
              Returns
            </h4>
            <p className="text-sm text-[#6B7280]">
              30-day easy return policy. Items must be unused and in original packaging.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#0F0F0F] mb-1">
              Replacements
            </h4>
            <p className="text-sm text-[#6B7280]">
              Defective items will be replaced free of charge within 7 days of purchase.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "washcare",
      title: "Wash Care",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">
            To ensure your product lasts longer, follow these wash care instructions:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl mb-1">🧊</div>
              <p className="text-xs font-semibold text-[#0F0F0F]">Cold Water</p>
              <p className="text-[10px] text-[#6B7280]">30°C max</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🚫</div>
              <p className="text-xs font-semibold text-[#0F0F0F]">No Bleach</p>
              <p className="text-[10px] text-[#6B7280]">Bleach prohibited</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🌪️</div>
              <p className="text-xs font-semibold text-[#0F0F0F]">Gentle Spin</p>
              <p className="text-[10px] text-[#6B7280]">Low heat dry</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔥</div>
              <p className="text-xs font-semibold text-[#0F0F0F]">Cool Iron</p>
              <p className="text-[10px] text-[#6B7280]">Low heat only</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3 border-t border-[#E5E5E5] pt-6">
      <h3 className="text-lg font-bold text-[#0F0F0F]">Details</h3>
      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="border border-[#E5E5E5] rounded-xl">
            <button
              onClick={() =>
                setOpenSection(
                  openSection === section.id ? null : section.id
                )
              }
              className="w-full flex items-center justify-between p-4 hover:bg-[#F5F5F5] transition-colors"
            >
              <span className="font-semibold text-sm text-[#0F0F0F]">
                {section.title}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openSection === section.id ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-4 pb-4 border-t border-[#E5E5E5]">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

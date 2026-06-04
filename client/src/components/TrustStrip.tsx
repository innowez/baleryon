"use client";

import { Truck, Shield, RotateCcw, Star } from "lucide-react";
import { motion } from "motion/react";

const items = [
  {
    icon: Truck,
    label: "Free Shipping",
    sub: "Orders above ₹999",
  },
  {
    icon: Shield,
    label: "Secure Payments",
    sub: "100% safe & encrypted",
  },
  {
    icon: RotateCcw,
    label: "Easy Returns",
    sub: "30-day hassle-free",
  },
  {
    icon: Star,
    label: "Premium Quality",
    sub: "Crafted with care",
  },
];

export function TrustStrip() {
  return (
    <section className="py-8 sm:py-12 bg-white border-b border-[#F0F0F0]">
      <div className="container-max">
        {/* Mobile: horizontal scroll strip */}
        <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="flex-shrink-0 w-[160px] sm:w-auto flex items-center gap-3 bg-[#F8F8F8] rounded-2xl px-4 py-4"
              >
                <div className="w-10 h-10 bg-[#0F0F0F] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F0F0F] leading-tight">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

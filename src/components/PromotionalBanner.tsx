"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Timer } from "lucide-react";

export function PromotionalBanner() {
  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <div className="container-max">
        <div className="relative rounded-3xl overflow-hidden bg-[#0F0F0F]">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1556821552-5f3fee5084ab?w=1200&q=80"
              alt="New season drop"
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/80 to-transparent" />
          </div>

          {/* Content — stack on mobile, side by side on desktop */}
          <div className="relative z-10 flex flex-col md:flex-row items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex-1 p-8 sm:p-10 md:p-14 space-y-5"
            >
              {/* Limited time badge */}
              <div className="flex items-center gap-2 text-[#FF3B30]">
                <Timer size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Limited Time Drop</span>
              </div>

              <h2 className="heading-section text-white">
                NEW SEASON<br />DROP
              </h2>

              <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-sm">
                Minimal streetwear designed for everyday confidence. Crafted with premium materials
                and modern aesthetics.
              </p>

              {/* Static countdown UI */}
              <div className="flex gap-3">
                {[
                  { val: "02", label: "Days" },
                  { val: "14", label: "Hours" },
                  { val: "39", label: "Mins" },
                  { val: "55", label: "Secs" },
                ].map((t) => (
                  <div key={t.label} className="text-center">
                    <div className="bg-white/10 border border-white/20 text-white font-bold text-lg sm:text-2xl w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-xl">
                      {t.val}
                    </div>
                    <p className="text-[10px] text-white/50 mt-1 uppercase">{t.label}</p>
                  </div>
                ))}
              </div>

              <button className="flex items-center gap-2 bg-white text-[#0F0F0F] font-semibold px-6 py-3 rounded-xl hover:bg-[#F5F5F5] active:scale-95 transition-all touch-manipulation w-full sm:w-auto justify-center sm:justify-start">
                Explore Collection <ArrowRight size={16} />
              </button>
            </motion.div>

            {/* Image block (desktop only right side) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block w-96 h-[480px] relative flex-shrink-0"
            >
              <Image
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80"
                alt="Model in new collection"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0F0F0F]/20" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const images = [
  {
    src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    label: "Urban Editorial",
    tag: "SS 2026",
  },
  {
    src: "https://images.unsplash.com/photo-1493381070836-27bcf41bc55f?w=400&q=80",
    label: "Street Culture",
    tag: "Lookbook",
  },
  {
    src: "https://images.unsplash.com/photo-1532453288759-924cdbb24744?w=400&q=80",
    label: "Night Mode",
    tag: "Editorial",
  },
  {
    src: "https://images.unsplash.com/photo-1525887041571-fd5e66cdc94f?w=400&q=80",
    label: "Raw Energy",
    tag: "Feature",
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    label: "Minimal Drops",
    tag: "New",
  },
  {
    src: "https://images.unsplash.com/photo-1485527093519-f21cdc6f0212?w=600&q=80",
    label: "Active Wear",
    tag: "Collection",
  },
];

export function EditorialLookbook() {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-max">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-6 sm:mb-10"
        >
          <div>
            <span className="section-label">The Lookbook</span>
            <h2 className="heading-section">URBAN STORIES</h2>
          </div>
          <button className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:text-[#FF3B30] transition-colors">
            View All <ArrowRight size={15} />
          </button>
        </motion.div>

        {/* Mobile: horizontal scroll strip */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {images.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              className="relative flex-shrink-0 w-[72vw] sm:w-auto aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group snap-start"
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Top tag */}
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/30 tracking-wide">
                {item.tag}
              </div>

              {/* Bottom label */}
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 z-10">
                <p className="text-white font-bold text-base sm:text-lg leading-tight mb-1">
                  {item.label}
                </p>
                <span className="flex items-center gap-1 text-white/60 text-xs font-medium group-hover:text-white group-hover:gap-2 transition-all duration-300">
                  Explore <ArrowRight size={11} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="flex justify-center mt-5 sm:hidden">
          <button className="flex items-center gap-1.5 text-sm font-semibold border border-[#E5E5E5] px-5 py-2.5 rounded-xl hover:bg-[#F5F5F5] active:scale-95 transition-all touch-manipulation">
            View Full Lookbook <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

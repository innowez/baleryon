"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Oversized Tees",
    tag: "Bestseller",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
  },
  {
    name: "Shirts",
    tag: "New In",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  },
  {
    name: "Cargo Pants",
    tag: "Trending",
    image: "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=600&q=80",
  },
  {
    name: "Sneakers",
    tag: "Limited",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  },
  {
    name: "Jackets",
    tag: "Drop",
    image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=600&q=80",
  },
  {
    name: "Accessories",
    tag: "New",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-14 sm:py-20 bg-[#F8F8F8]">
      <div className="container-max">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-label">Explore</span>
            <h2 className="heading-section">SHOP BY CATEGORY</h2>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#0F0F0F] hover:text-[#FF3B30] transition-colors"
          >
            View All <ArrowRight size={16} />
          </motion.button>
        </div>

        {/* Mobile: horizontal snap scroll */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 md:gap-5">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className="relative flex-shrink-0 w-[60vw] sm:w-auto aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group snap-start"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-all duration-300" />

              {/* Tag */}
              <div className="absolute top-3 left-3 bg-[#FF3B30] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide">
                {cat.tag}
              </div>

              {/* Label */}
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 z-10">
                <h3 className="text-white font-bold text-lg sm:text-xl leading-tight mb-1">
                  {cat.name}
                </h3>
                <span className="flex items-center gap-1 text-white/70 text-xs font-medium group-hover:text-white group-hover:gap-2 transition-all duration-300">
                  Shop Now <ArrowRight size={12} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile view-all */}
        <div className="flex justify-center mt-5 sm:hidden">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-[#0F0F0F] border border-[#E5E5E5] px-5 py-2.5 rounded-xl hover:bg-[#F0F0F0] transition-colors touch-manipulation">
            View All Categories <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

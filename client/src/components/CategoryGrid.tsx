"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useLandingStore } from "@/store/landingStore";

export function CategoryGrid() {
  const { categories, loading, error, getCategories } = useLandingStore();

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  if (loading) {
    return (
      <section className="py-14 sm:py-20">
        <div className="container-max">
          <h2 className="heading-section mb-6">SHOP BY CATEGORY</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-14 sm:py-20">
        <div className="container-max text-center">
          <p className="text-red-500">{error}</p>

          <button
            onClick={getCategories}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return (
      <section className="py-14 sm:py-20">
        <div className="container-max text-center">No categories found</div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-20 bg-[#F8F8F8]">
      <div className="container-max">
        <div className="flex items-end justify-between mb-6 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label">Explore</span>
            <h2 className="heading-section">SHOP BY CATEGORY</h2>
          </motion.div>

          <button className="hidden sm:flex items-center gap-1.5 text-sm font-semibold">
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 md:gap-5">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.45,
                delay: idx * 0.05,
              }}
              className="relative flex-shrink-0 w-[60vw] sm:w-auto aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group snap-start"
            >
              <Image
                src={category.image || "/images/category-placeholder.jpg"}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3 bg-[#FF3B30] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                {category._count.products} Products
              </div>

              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 z-10">
                <h3 className="text-white font-bold text-lg sm:text-xl">
                  {category.name}
                </h3>

                <span className="flex items-center gap-1 text-white/70 text-xs font-medium group-hover:text-white">
                  Shop Now
                  <ArrowRight size={12} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

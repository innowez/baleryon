
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useLandingStore } from "@/store/landingStore";

export function CategoryGrid() {
  const {
    categories,
    loading,
    error,
    getCategories,
  } = useLandingStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  // Fetch categories
  useEffect(() => {
    void getCategories();
  }, [getCategories]);

  // Check available scroll directions
  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;

    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const {
      scrollLeft,
      scrollWidth,
      clientWidth,
    } = container;

    setCanScrollLeft(scrollLeft > 2);

    setCanScrollRight(
      scrollLeft + clientWidth < scrollWidth - 2
    );
  }, []);

  // Update scroll buttons when categories change
  useEffect(() => {
    if (loading || !categories.length) return;

    const container = scrollRef.current;
    if (!container) return;

    const frame = requestAnimationFrame(
      updateScrollButtons
    );

    const observer = new ResizeObserver(
      updateScrollButtons
    );

    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [
    loading,
    categories.length,
    updateScrollButtons,
  ]);

  // Scroll one card at a time
  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-category-card]"
      );

    if (!firstCard) return;

    const gap = parseFloat(
      window.getComputedStyle(container).columnGap
    ) || 0;

    const distance =
      firstCard.getBoundingClientRect().width + gap;

    container.scrollBy({
      left:
        direction === "left"
          ? -distance
          : distance,
      behavior: "smooth",
    });
  };

  // Loading skeleton
  if (loading && categories.length === 0) {
    return (
      <section className="py-14 sm:py-20 bg-[#F8F8F8]">
        <div className="container-max">
          <h2 className="heading-section mb-6 sm:mb-10">
            SHOP BY CATEGORY
          </h2>

          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="w-[48vw] sm:w-[calc((100%-3rem)/4)] shrink-0 aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && categories.length === 0) {
    return (
      <section className="py-14 sm:py-20 bg-[#F8F8F8]">
        <div className="container-max text-center">
          <p className="text-red-500 text-sm">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void getCategories()}
            className="mt-4 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (!categories.length) {
    return (
      <section className="py-14 sm:py-20 bg-[#F8F8F8]">
        <div className="container-max text-center text-gray-500">
          No categories found
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-20 bg-[#F8F8F8] overflow-hidden">
      <div className="container-max">

        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
            }}
          >
            <span className="section-label">
              Explore
            </span>

            <h2 className="heading-section">
              SHOP BY CATEGORY
            </h2>
          </motion.div>

          {/* Desktop scroll controls */}
          <div className="hidden sm:flex items-center gap-2">

            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E5E5E5] text-[#0F0F0F] hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0F0F0F]"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E5E5E5] text-[#0F0F0F] hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0F0F0F]"
            >
              <ChevronRight size={20} />
            </button>

          </div>
        </div>

        {/* Horizontal Scroll Categories */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="
            flex
            gap-3
            sm:gap-4
            md:gap-5
            overflow-x-auto
            overflow-y-hidden
            scroll-smooth
            snap-x
            snap-mandatory
            -mx-3
            px-3
            sm:mx-0
            sm:px-0
            pb-3
            scrollbar-hide
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              data-category-card
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.45,
                delay: Math.min(idx * 0.04, 0.2),
              }}
              className="
                shrink-0
                w-[48vw]
                sm:w-[calc((100%-2rem)/3)]
                lg:w-[calc((100%-3.75rem)/4)]
                snap-start
              "
            >
              <Link
                href={`/products?category=${encodeURIComponent(
                  category.name
                )}`}
                aria-label={`Shop ${category.name}`}
                className="block group"
              >
                {/* Category image */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#EAEAEA]">

                  <Image
                    src={
                      category.image ||
                      "/images/category-placeholder.jpg"
                    }
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Product count badge */}
                  <div className="absolute top-3 left-3 bg-[#FF3B30] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                    {category._count.products} Products
                  </div>

                  {/* Category content */}
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-4 z-10">

                    <h3 className="text-white font-bold text-lg sm:text-xl leading-tight">
                      {category.name}
                    </h3>

                    <span className="flex items-center gap-1 mt-1 text-white/75 text-xs font-medium transition-colors group-hover:text-white">
                      Shop Now
                      <ArrowRight size={13} />
                    </span>

                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile scroll controls */}
        {categories.length > 2 && (
          <div className="flex sm:hidden justify-center gap-3 mt-5">

            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E5E5E5] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={19} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E5E5E5] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={19} />
            </button>

          </div>
        )}

      </div>
    </section>
  );
}

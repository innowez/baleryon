"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onOpenModal: (index: number) => void;
}

export default function ProductGallery({
  images,
  productName,
  activeIndex,
  onIndexChange,
  onOpenModal,
}: ProductGalleryProps) {
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const scrollContainer = mobileScrollRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(scrollContainer.children).indexOf(
              entry.target as Element
            );
            if (index !== -1) {
              setActiveDot(index);
              onIndexChange(index);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    Array.from(scrollContainer.children).forEach((child) =>
      observer.observe(child)
    );

    return () => observer.disconnect();
  }, [onIndexChange]);

  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden md:flex gap-4">

        {/* Thumbnail strip — vertical */}
        <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onIndexChange(idx)}
              className={`relative w-[72px] h-[90px] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                idx === activeIndex
                  ? "border-[#0F0F0F]"
                  : "border-[#E5E5E5] hover:border-[#9CA3AF]"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} view ${idx + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div
          className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden cursor-zoom-in bg-[#F5F5F5]"
          onClick={() => onOpenModal(activeIndex)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={images[activeIndex]}
                alt={productName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 40vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Image counter pill */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="md:hidden">
        {/* Swipe strip */}
        <div
          ref={mobileScrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full rounded-2xl"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-full flex-shrink-0 aspect-[3/4] snap-center bg-[#F5F5F5] cursor-zoom-in"
              onClick={() => onOpenModal(idx)}
            >
              <Image
                src={img}
                alt={`${productName} image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 justify-center mt-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to image ${idx + 1}`}
              onClick={() => {
                setActiveDot(idx);
                onIndexChange(idx);
                mobileScrollRef.current?.scrollTo({
                  left: idx * (mobileScrollRef.current?.offsetWidth ?? 0),
                  behavior: "smooth",
                });
              }}
              className={`rounded-full transition-all duration-300 ${
                idx === activeDot
                  ? "w-5 h-1.5 bg-[#0F0F0F]"
                  : "w-1.5 h-1.5 bg-[#0F0F0F]/25"
              }`}
            />
          ))}
        </div>

        {/* Mobile thumbnail row — tap to jump */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: "none" }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveDot(idx);
                onIndexChange(idx);
                mobileScrollRef.current?.scrollTo({
                  left: idx * (mobileScrollRef.current?.offsetWidth ?? 0),
                  behavior: "smooth",
                });
              }}
              className={`relative flex-shrink-0 w-14 h-[70px] rounded-lg overflow-hidden border-2 transition-all ${
                idx === activeDot
                  ? "border-[#0F0F0F]"
                  : "border-[#E5E5E5]"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
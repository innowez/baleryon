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
      { threshold: 0.8 }
    );

    Array.from(scrollContainer.children).forEach((child) => {
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, [onIndexChange]);

  return (
    <>
      {/* Desktop: Flex Layout with Thumbnails + Main Image */}
      <div className="hidden md:flex gap-3">
        {/* Thumbnails */}
        <div className="w-20 flex flex-col gap-3 flex-shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onIndexChange(idx)}
              className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                idx === activeIndex
                  ? "border-[#0F0F0F] ring-2 ring-[#0F0F0F]/20"
                  : "border-[#E5E5E5] hover:border-[#0F0F0F]"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div
          className="flex-1 relative aspect-[3/4] product-img-wrap cursor-zoom-in group"
          onClick={() => onOpenModal(activeIndex)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={images[activeIndex]}
                alt={productName}
                fill
                className="object-cover image-zoom"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: Swipe Slider with Dots */}
      <div className="md:hidden">
        {/* Swipe Container */}
        <div
          ref={mobileScrollRef}
          className="snap-scroll-x scrollbar-hide w-full flex overflow-x-auto mb-3"
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="snap-center w-full flex-shrink-0 relative aspect-[3/4] product-img-wrap cursor-zoom-in"
              onClick={() => onOpenModal(idx)}
            >
              <Image
                src={img}
                alt={`${productName} image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-2 justify-center">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveDot(idx);
                onIndexChange(idx);
                mobileScrollRef.current?.scrollTo({
                  left: (idx * mobileScrollRef.current.offsetWidth),
                  behavior: "smooth",
                });
              }}
              className={`rounded-full transition-all duration-300 ${
                idx === activeDot
                  ? "w-6 h-2 bg-[#0F0F0F]"
                  : "w-2 h-2 bg-[#0F0F0F]/30"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

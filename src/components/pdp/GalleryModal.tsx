"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryModalProps {
  images: string[];
  initialIndex: number;
  productName: string;
  onClose: () => void;
}

export default function GalleryModal({
  images,
  initialIndex,
  productName,
  onClose,
}: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Main Image */}
        <div className="relative w-full h-full max-w-2xl max-h-[90vh]">
          <Image
            src={images[currentIndex]}
            alt={productName}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </div>

        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={28} className="text-white" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
          <p className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

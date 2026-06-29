"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { menProducts } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";

export function BestSellers() {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const addToCart = useCartStore((state) => state.addItem);

  const products = menProducts.slice(2, 8);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainer.current;
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = (product: (typeof menProducts)[0]) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <section className="py-14 sm:py-20 bg-[#F5F5F5] overflow-hidden">
      <div className="container-max">
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF3B30] mb-2 block">
              Customer Favorites
            </span>
            <h2 className="heading-section">BEST SELLERS</h2>
          </motion.div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-2.5 rounded-full bg-white hover:bg-[#0F0F0F] hover:text-white transition-colors touch-manipulation hidden sm:flex"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-2.5 rounded-full bg-white hover:bg-[#0F0F0F] hover:text-white transition-colors touch-manipulation hidden sm:flex"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollContainer}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              onMouseEnter={() => setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex-shrink-0 w-64 snap-start group"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-2xl bg-white aspect-[3/4] mb-4">
                <Image
                  src={hovered === product.id && product.image2 ? product.image2 : product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-xs font-bold px-2.5 py-1 rounded-full tracking-widest">
                  BEST
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">
                  {product.category}
                </p>
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-[#FF3B30] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 pt-2">
                  <span className="font-bold text-[#0F0F0F]">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#6B7280] line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(product.rating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#6B7280]">
                    ({product.reviews})
                  </span>
                </div>
              </div>

              {/* Add button — always visible */}
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full mt-3 bg-[#0F0F0F] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0F0F0F]/90 active:scale-95 transition-all touch-manipulation"
              >
                <ArrowRight size={14} /> Shop
              </button>
            </motion.div>
          ))}
        </div>

        {/* Mobile controls */}
        <div className="flex gap-2 justify-center mt-5 sm:hidden">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white hover:bg-[#0F0F0F] hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white hover:bg-[#0F0F0F] hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
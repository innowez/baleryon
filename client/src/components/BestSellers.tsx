"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchBestSellers } from "@/lib/productsApi";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";

export function BestSellers() {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    let active = true;

    fetchBestSellers(6)
      .then((data) => {
        if (active) {
          setProducts(data);
        }
      })
      .catch(() => {
        if (active) {
          setProducts([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainer.current;

    if (container) {
      container.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    toast.success(`${product.name} added to cart`);
  };

  // Hide the section when no best sellers are available.
  if (products.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#F5F5F5] overflow-hidden">
      <div className="container-max">
        {/* Section heading */}
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

          {/* Desktop scroll controls */}
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-2.5 rounded-full bg-white hover:bg-[#0F0F0F] hover:text-white transition-colors touch-manipulation"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-2.5 rounded-full bg-white hover:bg-[#0F0F0F] hover:text-white transition-colors touch-manipulation"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable products */}
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
              {/* Product image: click to open details */}
              <Link
                href={`/products/${product.id}`}
                aria-label={`View ${product.name} details`}
                className="block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white aspect-[3/4] mb-4">
                  <Image
                    src={
                      hovered === product.id && product.image2
                        ? product.image2
                        : product.image
                    }
                    alt={product.name}
                    fill
                    sizes="256px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  <div className="absolute top-3 left-3 bg-white/95 text-xs font-bold px-2.5 py-1 rounded-full tracking-widest">
                    BEST
                  </div>
                </div>
              </Link>

              {/* Product information */}
              <div className="space-y-2">
                <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">
                  {product.category}
                </p>

                <Link href={`/products/${product.id}`} className="block">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-[#FF3B30] transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 pt-2">
                  <span className="font-bold text-[#0F0F0F]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>

                  <span className="text-xs text-[#6B7280] line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div
                    className="flex text-yellow-400 text-xs"
                    aria-label={`Rated ${product.rating} out of 5`}
                  >
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

              {/* Add to Cart: adds item without navigating */}
              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className="w-full mt-3 bg-[#0F0F0F] text-white py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#FF3B30] active:scale-95 transition-all touch-manipulation"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            </motion.div>
          ))}
        </div>

        {/* Mobile scroll controls */}
        <div className="flex gap-2 justify-center mt-5 sm:hidden">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="p-2 rounded-full bg-white hover:bg-[#0F0F0F] hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="p-2 rounded-full bg-white hover:bg-[#0F0F0F] hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

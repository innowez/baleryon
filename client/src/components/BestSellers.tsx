"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { fetchBestSellers } from "@/lib/productsApi";
import type { Product } from "@/types/product";
import { useWishlistStore } from "@/store/useWishlistStore";

export function BestSellers() {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const items = useWishlistStore((state) => state.items);
  const wishlistReady = useWishlistStore((state) => state.ready);
  const wishlistSyncing = useWishlistStore((state) => state.syncing);
  const wishlistError = useWishlistStore((state) => state.error);

  const addToWishlist = useWishlistStore((state) => state.addToWishlist);

  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );

  useEffect(() => {
    let active = true;

    fetchBestSellers(6)
      .then((data) => {
        if (active) {
          setProducts(data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch best sellers:", error);

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

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  const handleWishlist = async (product: Product) => {
    const state = useWishlistStore.getState();

    console.log("[Wishlist] Button clicked", {
      productId: product.id,
      mode: state.mode,
      ready: state.ready,
      syncing: state.syncing,
    });

    if (!state.ready || state.mode === "unknown") {
      toast.error(state.error ?? "Wishlist session is not initialized.");
      return;
    }

    if (state.syncing || busyProductId) return;

    setBusyProductId(product.id);

    try {
      const alreadySaved = state.isFavorited(product.id);

      const result = alreadySaved
        ? await state.removeFromWishlist(product.id)
        : await state.addToWishlist({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
          });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(
        alreadySaved ? "Removed from wishlist" : "Added to wishlist",
      );
    } catch (error) {
      console.error("[Wishlist] Request failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Wishlist request failed.",
      );
    } finally {
      setBusyProductId(null);
    }
  };

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
          {products.map((product, idx) => {
            const isWishlisted = items.some(
              (item) => item.productId === product.id,
            );

            const isBusy = busyProductId === product.id;

            return (
              <motion.div
                key={product.id}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.05,
                }}
                onMouseEnter={() => setHovered(product.id)}
                onMouseLeave={() => setHovered(null)}
                className="flex-shrink-0 w-64 snap-start group"
              >
                {/* Product image card */}
                <div className="relative overflow-hidden rounded-2xl bg-white aspect-[3/4] mb-4">
                  {/* Product image link */}
                  <Link
                    href={`/products/${product.id}`}
                    aria-label={`View ${product.name} details`}
                    className="absolute inset-0 z-0 block"
                  >
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
                  </Link>

                  {/* BEST badge */}
                  <div className="absolute top-3 left-3 z-10 pointer-events-none bg-white/95 text-xs font-bold px-2.5 py-1 rounded-full tracking-widest">
                    BEST
                  </div>

                  {/* Wishlist button */}

                  <button
                    type="button"
                    disabled={isBusy || wishlistSyncing}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleWishlist(product);
                    }}
                    aria-label={
                      isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                    aria-pressed={isWishlisted}
                    className={`absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all hover:scale-110 disabled:opacity-50 ${
                      isWishlisted
                        ? "bg-white text-[#FF3B30]"
                        : "bg-white text-[#0F0F0F]"
                    }`}
                  >
                    <Heart
                      size={19}
                      className={
                        isWishlisted ? "fill-[#FF3B30] stroke-[#FF3B30]" : ""
                      }
                    />
                  </button>
                </div>

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

                  {/* Price */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="font-bold text-[#0F0F0F]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>

                    {product.originalPrice > product.price && (
                      <span className="text-xs text-[#6B7280] line-through">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
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
              </motion.div>
            );
          })}
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

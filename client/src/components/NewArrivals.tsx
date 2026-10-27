
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchNewArrivals } from "@/lib/productsApi";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export function NewArrivals() {
  const addToCart = useCartStore((state) => state.addItem);
  const { isFavorited, addToWishlist, removeFromWishlist } =
    useWishlistStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchNewArrivals(4)
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active) setProducts([]);
      });

    return () => {
      active = false;
    };
  }, []);

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

  const handleWishlist = (product: Product) => {
    if (isFavorited(product.id)) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });

      toast.success("Added to wishlist");
    }
  };

  const calculateDiscount = (original: number, current: number) =>
    original > 0
      ? Math.max(0, Math.round(((original - current) / original) * 100))
      : 0;

  if (products.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <div className="container-max">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-6 sm:mb-10"
        >
          <div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF3B30] mb-2 block">
              Just In
            </span>
            <h2 className="heading-section">NEW ARRIVALS</h2>
          </div>

          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#0F0F0F] hover:text-[#FF3B30] transition-colors"
          >
            View All <ArrowRight size={15} />
          </Link>
        </motion.div>

        {/* Mobile horizontal scroll, desktop grid */}
        <div className="flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              onMouseEnter={() => setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex-shrink-0 w-[72vw] sm:w-auto snap-start group"
            >
              {/* Product image */}
              <Link
                href={`/products/${product.id}`}
                aria-label={`View ${product.name} details`}
                className="block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-[#F5F5F5] aspect-[3/4] mb-4">
                  <Image
                    src={
                      hovered === product.id && product.image2
                        ? product.image2
                        : product.image
                    }
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 72vw, (max-width: 1024px) 45vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Discount badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 bg-[#FF3B30] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide">
                    {calculateDiscount(
                      product.originalPrice,
                      product.price,
                    )}
                    % OFF
                  </div>
                </div>
              </Link>

              {/* Wishlist button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleWishlist(product)}
                  className="absolute -top-[calc(3/4*72vw+3.5rem)] right-3 z-10 sm:hidden"
                  aria-label={
                    isFavorited(product.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <span className="sr-only">Wishlist</span>
                </button>
              </div>

              {/* Product information */}
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs text-[#6B7280] uppercase font-bold tracking-widest">
                  {product.category}
                </p>

                <Link
                  href={`/products/${product.id}`}
                  className="block"
                >
                  <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-[#FF3B30] transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F0F0F]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>

                  <span className="text-xs sm:text-sm text-[#6B7280] line-through">
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

                  <span className="text-xs text-[#6B7280]">
                    ({product.reviews})
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-[#0F0F0F] text-white py-2.5 sm:py-3 px-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#FF3B30] active:scale-95 transition-all touch-manipulation text-xs sm:text-sm"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() => handleWishlist(product)}
                  aria-label={
                    isFavorited(product.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  className={`px-3 py-2.5 sm:py-3 rounded-xl border active:scale-95 transition-all touch-manipulation ${
                    isFavorited(product.id)
                      ? "border-[#FF3B30] text-[#FF3B30] bg-red-50"
                      : "border-[#E5E5E5] text-[#0F0F0F] hover:border-[#FF3B30] hover:text-[#FF3B30]"
                  }`}
                >
                  <Heart
                    size={17}
                    className={
                      isFavorited(product.id) ? "fill-current" : ""
                    }
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="flex justify-center mt-5 sm:hidden">
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-sm font-semibold border border-[#E5E5E5] px-5 py-2.5 rounded-xl hover:bg-[#F5F5F5] active:scale-95 transition-all touch-manipulation"
          >
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

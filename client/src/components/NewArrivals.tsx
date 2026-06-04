"use client";

import Image from "next/image";
import { Heart, Plus, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { menProducts } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export function NewArrivals() {
  const addToCart = useCartStore((state) => state.addItem);
  const { isFavorited, addToWishlist, removeFromWishlist } = useWishlistStore();

  const products = menProducts.slice(0, 4);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleAddToCart = (product: (typeof menProducts)[0]) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const handleWishlist = (product: (typeof menProducts)[0]) => {
    if (isFavorited(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-max">
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
          <button className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#0F0F0F] hover:text-[#FF3B30] transition-colors">
            View All <ArrowRight size={15} />
          </button>
        </motion.div>

        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              onMouseEnter={() => setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex-shrink-0 w-[72vw] sm:w-auto snap-start group"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl bg-[#F5F5F5] aspect-[3/4] mb-4">
                {/* Discount Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 bg-[#FF3B30] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide">
                  {calculateDiscount(product.originalPrice, product.price)}% OFF
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => handleWishlist(product)}
                  className="absolute top-2.5 right-2.5 z-10 bg-white rounded-full p-2.5 shadow-md hover:scale-110 active:scale-95 transition-transform touch-manipulation"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={16}
                    className={
                      isFavorited(product.id)
                        ? "text-[#FF3B30] fill-[#FF3B30]"
                        : "text-[#0F0F0F]"
                    }
                  />
                </button>

                {/* Images */}
                <Image
                  src={hovered === product.id ? product.image2 : product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs text-[#6B7280] uppercase font-bold tracking-widest">
                  {product.category}
                </p>
                <h3 className="heading-product line-clamp-2 text-sm sm:text-base">
                  {product.name}
                </h3>

                {/* Pricing */}
                <div className="flex items-center gap-2">
                  <span className="price-text text-[#0F0F0F]">₹{product.price.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm text-[#6B7280] line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs">
                        {i < Math.floor(product.rating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-[#6B7280]">
                    ({product.reviews})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 sm:hidden">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-[#0F0F0F] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0F0F0F]/90 active:scale-95 transition-all touch-manipulation text-sm"
                >
                  {/* <Plus size={16} />  */}
                  Add To Cart
                </button>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-[#FF3B30] text-white py-2.5 rounded-xl font-semibold hover:bg-[#FF3B30]/90 active:scale-95 transition-all touch-manipulation text-sm"
                >
                  Buy Now
                </button>
              </div>

              {/* Desktop Hover Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={
                  hovered === product.id
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 10 }
                }
                transition={{ duration: 0.3 }}
                className="hidden sm:flex gap-2 mt-4"
              >
                <motion.button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-[#0F0F0F] text-white py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0F0F0F]/90 active:scale-95 transition-all touch-manipulation text-sm"
                >
                  <Plus size={16} /> Add to Cart
                </motion.button>
                <motion.button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-[#FF3B30] text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-[#FF3B30]/90 active:scale-95 transition-all touch-manipulation text-sm"
                >
                  Buy Now
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="flex justify-center mt-5 sm:hidden">
          <button className="flex items-center gap-1.5 text-sm font-semibold border border-[#E5E5E5] px-5 py-2.5 rounded-xl hover:bg-[#F5F5F5] active:scale-95 transition-all touch-manipulation">
            View All Products <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

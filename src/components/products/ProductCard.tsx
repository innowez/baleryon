"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, Eye } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

type ProductCardProps = {
  product: Product;
  index: number;
};

export function ProductCard({ product, index }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);
  const { isFavorited, addToWishlist, removeFromWishlist } = useWishlistStore();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const handleWishlist = () => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col"
    >
      {/* Image Container */}
      <div className="product-img-wrap relative overflow-hidden rounded-2xl bg-[#F5F5F5] aspect-[3/4] mb-4">
        {/* Discount Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-[#FF3B30] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide">
          {calculateDiscount(product.originalPrice, product.price)}% OFF
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWishlist();
          }}
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
          src={hovered ? product.image2 : product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-2 flex-1 flex flex-col">
        <p className="text-[10px] sm:text-xs text-[#6B7280] uppercase font-bold tracking-widest">
          {product.category}
        </p>
        <h3 className="heading-product line-clamp-2 text-sm sm:text-base flex-1">
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
          <span className="text-xs text-[#6B7280]">({product.reviews})</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {/* Quick Add Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={
            hovered
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 10 }
          }
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className="flex-1 bg-[#0F0F0F] text-white py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0F0F0F]/90 active:scale-95 transition-all touch-manipulation text-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Plus size={16} /> Add
        </motion.button>

        {/* View Details Button */}
        <Link
          href={`/products/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 border border-[#E5E5E5] text-[#0F0F0F] py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#F5F5F5] active:scale-95 transition-all touch-manipulation text-sm"
        >
          <Eye size={16} /> View
        </Link>
      </div>
    </motion.div>
  );
}

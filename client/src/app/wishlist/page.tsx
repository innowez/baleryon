"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (item: {
    productId: string;
    name: string;
    price: number;
    image: string;
  }) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">
      <div className="container-max py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/"
              className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="heading-section">My Wishlist</h1>
              <p className="text-sm text-[#6B7280] mt-1">
                {items.length} item{items.length !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>
        </motion.div>

        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
              <Heart size={32} className="text-[#6B7280]" />
            </div>
            <h2 className="text-xl font-bold mb-2">No items in your wishlist</h2>
            <p className="text-[#6B7280] mb-6 max-w-sm">
              Start adding items you love to your wishlist to save them for later
            </p>
            <Link
              href="/products"
              className="bg-[#0F0F0F] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#0F0F0F]/90 active:scale-95 transition-all touch-manipulation"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          /* Products Grid */
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-[#F5F5F5] aspect-[3/4] mb-3">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute top-2.5 right-2.5 z-10 bg-white rounded-full p-2.5 shadow-md hover:scale-110 active:scale-95 transition-transform touch-manipulation"
                    aria-label="Remove from wishlist"
                  >
                    <Heart
                      size={16}
                      className="text-[#FF3B30] fill-[#FF3B30]"
                    />
                  </button>

                  {/* Image */}
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="heading-product line-clamp-2 text-sm sm:text-base">
                    {item.name}
                  </h3>
                  <p className="price-text text-[#0F0F0F]">
                    ₹{item.price.toLocaleString()}
                  </p>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-[#0F0F0F] text-white py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0F0F0F]/90 active:scale-95 transition-all touch-manipulation text-sm mt-2"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Heart, ShoppingCart, ArrowLeft, RefreshCw } from "lucide-react";

import { useWishlistStore, type WishlistItem } from "@/store/useWishlistStore";

import { useCartStore } from "@/store/useCartStore";
import { fetchShopProductById } from "@/lib/productsApi";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";

export default function WishlistPage() {
  const router = useRouter();

  const { items, ready, syncing, error, removeFromWishlist, refresh } =
    useWishlistStore();

  const cartReady = useCartStore((s) => s.ready);
  const addToCart = useCartStore((s) => s.addItem);

  const [busyId, setBusyId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    setBusyId(productId);

    try {
      const result = await removeFromWishlist(productId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Removed from wishlist");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!cartReady) {
      toast.error("Cart is still initializing.");
      return;
    }

    setBusyId(item.productId);

    try {
      // Fetch current product options from backend.
      const product = await fetchShopProductById(item.productId);

      const hasSize = product.sizes.length > 0;

      const hasColor = product.colors.length > 0;

      // Product options must be selected on PDP.
      if (hasSize || hasColor) {
        toast.info("Please select your size and color.");

        router.push(`/products/${item.productId}`);

        return;
      }

      const result = await addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        needsSize: false,
        needsColor: false,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Added to cart");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add product to cart.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header variant="solid" />

      <main className="pt-[calc(2rem+2rem)] pb-22 md:pb-9">
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
                    {ready
                      ? `${items.length} item${
                          items.length !== 1 ? "s" : ""
                        } saved`
                      : "Loading wishlist..."}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>

                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="mt-2 flex items-center gap-2 text-sm font-semibold text-red-700"
                >
                  <RefreshCw size={15} />
                  Retry
                </button>
              </div>
            )}

            {/* Loading */}
            {!ready ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-2xl bg-gray-100" />
                    <div className="mt-3 h-4 rounded bg-gray-100" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                  <Heart size={32} className="text-[#6B7280]" />
                </div>

                <h2 className="text-xl font-bold mb-2">
                  No items in your wishlist
                </h2>

                <p className="text-[#6B7280] mb-6 max-w-sm">
                  Save your favorite products here to find them later.
                </p>

                <Link
                  href="/products"
                  className="bg-[#0F0F0F] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#0F0F0F]/90"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            ) : (
              /* Wishlist products */
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
              >
                {items.map((item, idx) => {
                  const busy = busyId === item.productId;

                  return (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: idx * 0.05,
                      }}
                      className="group"
                    >
                      {/* Image card */}
                      <div className="relative overflow-hidden rounded-2xl bg-[#F5F5F5] aspect-[3/4] mb-3">
                        <Link
                          href={`/products/${item.productId}`}
                          className="absolute inset-0 z-0 block"
                          aria-label={`View ${item.name}`}
                        >
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                        </Link>

                        {/* Wishlist remove button */}
                        <button
                          type="button"
                          disabled={busy || syncing}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            void handleRemove(item.productId);
                          }}
                          aria-label="Remove from wishlist"
                          className="absolute top-2.5 right-2.5 z-20 bg-white rounded-full p-2.5 shadow-md hover:scale-110 active:scale-95 transition-transform disabled:opacity-50"
                        >
                          <Heart
                            size={16}
                            className="text-[#FF3B30] fill-[#FF3B30]"
                          />
                        </button>
                      </div>

                      {/* Product info */}
                      <div className="space-y-2">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="heading-product line-clamp-2 text-sm sm:text-base">
                            {item.name}
                          </h3>
                        </Link>

                        <p className="price-text text-[#0F0F0F]">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>

                        <button
                          type="button"
                          disabled={busy || !cartReady}
                          onClick={() => void handleAddToCart(item)}
                          className="w-full bg-[#0F0F0F] text-white py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0F0F0F]/90 active:scale-95 transition-all text-sm mt-2 disabled:opacity-50"
                        >
                          <ShoppingCart size={16} />

                          {busy ? "Please wait..." : "Add to Cart"}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

"use client";

import { useState } from "react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { motion } from "motion/react";

interface CartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDialog({ isOpen, onClose }: CartDialogProps) {
  const { items, totalPrice, removeItem, updateQuantity } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50 md:hidden"
      />

      {/* Cart Drawer */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 md:hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] sticky top-0 bg-white rounded-t-3xl">
          <h2 className="text-lg font-bold">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[#6B7280] mb-2">Your cart is empty</p>
              <button
                onClick={onClose}
                className="text-sm text-[#FF3B30] font-semibold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 bg-[#F5F5F5] rounded-xl"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col">
                  <p className="font-semibold text-sm line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    ₹{item.price.toLocaleString()}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.size,
                          item.color
                        )
                      }
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.size,
                          item.color
                        )
                      }
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() =>
                    removeItem(item.productId, item.size, item.color)
                  }
                  className="p-2 text-[#FF3B30] hover:bg-[#FFE5E5] rounded-lg transition-colors self-start shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E5E5E5] p-4 space-y-3 sticky bottom-0 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Total Price:</span>
              <span className="text-lg font-bold">
                ₹{totalPrice.toLocaleString()}
              </span>
            </div>
            <a
              href="/checkout"
              onClick={onClose}
              className="w-full block text-center bg-[#0F0F0F] text-white py-3 rounded-xl font-semibold hover:bg-[#0F0F0F]/90 active:scale-95 transition-all touch-manipulation"
            >
              Proceed to Checkout
            </a>
          </div>
        )}
      </motion.div>
    </>
  );
}

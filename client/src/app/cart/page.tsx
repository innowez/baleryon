"use client";

import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";

export default function CartPage() {
  const { items, totalPrice, removeItem, updateQuantity } = useCartStore();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">
              Add some products to continue shopping.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-xl font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 flex gap-4"
                >
                  <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>

                        {item.size && (
                          <p className="text-sm text-gray-500">
                            Size: {item.size}
                          </p>
                        )}

                        {item.color && (
                          <p className="text-sm text-gray-500">
                            Color: {item.color}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg h-fit"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <p className="font-bold text-lg">
                        ₹{item.price.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-3 border rounded-xl px-3 py-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.size,
                              item.color,
                            )
                          }
                        >
                          <Minus size={16} />
                        </button>

                        <span className="font-semibold min-w-[20px] text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.size,
                              item.color,
                            )
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Items</span>
                    <span>{items.length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>

                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <a
                  href="/checkout"
                  className="mt-6 block w-full text-center bg-black text-white py-4 rounded-xl font-semibold hover:bg-black/90"
                >
                  Proceed to Checkout
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

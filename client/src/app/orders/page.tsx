"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuthStore } from "@/store/useAuthStore";
import { fetchUserOrders } from "@/lib/ordersApi";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { AnnouncementBar } from "@/components/AnnouncementBar";

import type { Order } from "@/types/order";

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    fetchUserOrders(user.id)
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="pt-[calc(2.5rem+4rem)] pb-24">
        <div className="container-max max-w-5xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="heading-section">My Orders</h1>
            <p className="text-[#6B7280] mt-2">
              Track your orders, delivery status, and history
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="py-20 text-center text-[#6B7280]">
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-medium">No orders yet</p>
              <p className="text-[#6B7280] mt-2">
                When you place orders, they will appear here
              </p>
              <Link
                href="/"
                className="inline-block mt-6 px-5 py-2.5 bg-black text-white rounded-xl"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block"
                >
                  <div className="group bg-white border border-[#E5E5E5] rounded-3xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-[#6B7280]">
                          Order
                        </p>
                        <h3 className="font-semibold text-lg group-hover:text-black">
                          #{order.orderNumber}
                        </h3>

                        <p className="text-sm text-[#6B7280] mt-1">
                          {new Date(order.placedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ₹{order.totalAmount}
                        </p>

                        <span
                          className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                            statusColor[order.orderStatus] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.orderStatus.replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img
                            key={item.id}
                            src={item.product?.images?.[0]?.imageUrl}
                            alt={item.product?.title}
                            className="w-12 h-12 object-cover rounded-xl border border-white"
                            style={{ zIndex: 10 - idx }}
                          />
                        ))}

                        {order.items.length > 3 && (
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#F5F5F5] text-xs font-semibold">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-[#6B7280]">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
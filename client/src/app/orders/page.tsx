"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchUserOrders } from "@/lib/ordersApi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import type { Order } from "@/types/order";

type FilterKey = "ALL" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

const statusStyle: Record<string, string> = {
  PENDING:           "border-[#633806] text-[#633806]",
  CONFIRMED:         "border-[#0C447C] text-[#0C447C]",
  PROCESSING:        "border-[#633806] text-[#633806]",
  SHIPPED:           "border-[#0C447C] text-[#0C447C]",
  OUT_FOR_DELIVERY:  "border-[#633806] text-[#633806]",
  DELIVERED:         "border-[#27500A] text-[#27500A]",
  CANCELLED:         "border-[#A32D2D] text-[#A32D2D]",
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("ALL");

  useEffect(() => {
    if (!user?.id) return;
    fetchUserOrders(user.id)
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = filter === "ALL"
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  return (
    <>
      <AnnouncementBar />
      <Header variant="solid" />

      <main className="pt-[calc(2.5rem+4rem)] pb-24 md:pb-12 min-h-screen">
        <div className="container-max max-w-4xl">

          {/* Page header */}
          <div className="flex items-end justify-between border-b border-[#E5E5E5] pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-medium tracking-tight">Orders</h1>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B7280] mt-2">
                {orders.length} order{orders.length !== 1 ? "s" : ""} placed
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Filter strip */}
              <div className="flex gap-px bg-[#E5E5E5] mb-8">
                {FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                      filter === key
                        ? "bg-[#0F0F0F] text-white"
                        : "bg-white text-[#6B7280] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Orders */}
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B7280]">
                    No orders found
                  </p>
                  <p className="text-xl font-medium mt-3">
                    {filter === "ALL" ? "Nothing here yet" : `No ${filter.toLowerCase()} orders`}
                  </p>
                  {filter === "ALL" && (
                    <Link
                      href="/"
                      className="inline-block mt-6 text-[10px] uppercase tracking-[0.12em] border border-[#0F0F0F] px-6 py-3 hover:bg-[#0F0F0F] hover:text-white transition-colors"
                    >
                      Start Shopping
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-px bg-[#E5E5E5]">
                  {filtered.map((order) => {
                    const images = order.items
                      .slice(0, 3)
                      .map((i) => i.product?.images?.[0]?.imageUrl)
                      .filter(Boolean);
                    const extra = order.items.length - 3;

                    return (
                      <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                        <div className="bg-white px-5 py-5 hover:bg-[#F8F8F8] transition-colors">

                          {/* Top row */}
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-[11px] text-[#6B7280] mt-0.5">
                                {new Date(order.placedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium">
                                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                              </p>
                              <span className={`inline-block mt-1.5 text-[10px] uppercase tracking-[0.09em] border px-2.5 py-0.5 ${statusStyle[order.orderStatus] ?? "border-[#E5E5E5] text-[#6B7280]"}`}>
                                {order.orderStatus.replaceAll("_", " ")}
                              </span>
                            </div>
                          </div>

                          {/* Bottom row — thumbnails + arrow */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0F0F0]">
                            <div className="flex items-center gap-2">
                              {images.map((src, idx) => (
                                <img
                                  key={idx}
                                  src={src}
                                  alt=""
                                  className="w-11 h-[52px] object-cover bg-[#F5F5F5]"
                                />
                              ))}
                              {extra > 0 && (
                                <div className="w-11 h-[52px] bg-[#F5F5F5] flex items-center justify-center text-[11px] text-[#6B7280]">
                                  +{extra}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                              <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>

                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { AnnouncementBar } from "@/components/AnnouncementBar";

import { fetchOrderTracking } from "@/lib/ordersApi";
import type { OrderTrackingResponse } from "@/types/order";

import { OrderItems } from "../OrderItems";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [data, setData] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);


  console.log(data,"datadatadatadatadatadatadatadata");
  
  useEffect(() => {
    if (!orderId) return;

    fetchOrderTracking(orderId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="pt-40 text-center text-[#6B7280]">
        Loading order details...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pt-40 text-center">
        Order not found
      </div>
    );
  }

  const { order, trackingSteps } = data;

  return (
    <>
      <AnnouncementBar />
      <Header variant="solid"/>

      <main className="pt-[calc(2.5rem+4rem)] pb-24">
        <div className="container-max max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-section">
              Order #{order.orderNumber}
            </h1>

            <p className="text-[#6B7280] mt-2">
              Placed on{" "}
              {new Date(order.placedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* TRACKING */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 mb-6">
            <h2 className="font-semibold mb-6">
              Order Tracking
            </h2>

            <div className="space-y-6">
              {trackingSteps.map((step, index) => (
                <div key={step.status} className="flex gap-4">
                  {/* Dot */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        step.completed
                          ? "bg-black"
                          : "bg-[#E5E5E5]"
                      }`}
                    />

                    {index !== trackingSteps.length - 1 && (
                      <div className="w-[2px] h-10 bg-[#E5E5E5]" />
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <p
                      className={`font-medium ${
                        step.current ? "text-black" : "text-[#6B7280]"
                      }`}
                    >
                      {step.label}
                    </p>

                    <p className="text-xs text-[#9CA3AF]">
                      {step.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <OrderItems items={order.items} />

              {/* Shipping */}
              <div className="bg-white border rounded-3xl p-6">
                <h2 className="font-semibold mb-4">
                  Shipping Address
                </h2>

                <div className="text-sm space-y-1 text-[#6B7280]">
                  <p className="text-black font-medium">
                    {order.address?.fullName}
                  </p>
                  <p>{order.address?.phone}</p>
                  <p>{order.address?.addressLine1}</p>
                  <p>
                    {order.address?.city},{" "}
                    {order.address?.state}
                  </p>
                  <p>{order.address?.postalCode}</p>
                </div>
              </div>
            </div>

            {/* RIGHT - SUMMARY */}
            <div className="bg-white border rounded-3xl p-6 h-fit">
              <h2 className="font-semibold mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{order.shippingAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>- ₹{order.discountAmount}</span>
                </div>

                <hr className="my-2" />

                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>

                <div className="pt-4">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
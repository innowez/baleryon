// app/profile/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  ChevronRight,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { fetchProfile } from "@/lib/profileApi";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { AnnouncementBar } from "@/components/AnnouncementBar";

import type { UserProfile } from "@/types/profile";

export default function ProfilePage() {
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    fetchProfile(user.id)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <>
        <AnnouncementBar />
        <Header />

        <main className="pt-[calc(2.5rem+4rem)] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-[#6B7280]">Loading profile...</p>
          </div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <AnnouncementBar />
        <Header />

        <main className="pt-[calc(2.5rem+4rem)] min-h-screen flex items-center justify-center">
          <p>Profile not found.</p>
        </main>
      </>
    );
  }

  const defaultAddress = profile.user.addresses?.[0];

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="pt-[calc(2.5rem+4rem)] pb-24 md:pb-10">
        <div className="container-max max-w-6xl">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-black via-[#111111] to-[#1E1E1E] text-white p-6 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <User size={42} />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-bold">
                  {profile.user.fullName}
                </h1>

                <p className="text-white/70 mt-2">
                  {profile.user.email}
                </p>

                <p className="text-white/60 text-sm mt-1">
                  {profile.user.phone || "No phone number"}
                </p>
              </div>

              <button className="px-5 py-3 rounded-2xl bg-white text-black font-semibold hover:opacity-90 transition">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="rounded-3xl bg-[#F8F8F8] p-6 border border-[#E5E5E5]">
              <ShoppingBag
                size={24}
                className="mb-4"
              />

              <p className="text-3xl font-bold">
                {profile.stats.totalOrders}
              </p>

              <p className="text-sm text-[#6B7280] mt-1">
                Total Orders
              </p>
            </div>

            <div className="rounded-3xl bg-[#FFF5F5] p-6 border border-red-100">
              <Heart
                size={24}
                className="mb-4 text-red-500"
              />

              <p className="text-3xl font-bold">
                {profile.stats.wishlistItems}
              </p>

              <p className="text-sm text-[#6B7280] mt-1">
                Wishlist Items
              </p>
            </div>

            <div className="rounded-3xl bg-[#F4FFF7] p-6 border border-green-100">
              <p className="text-3xl font-bold">
                ₹{Math.round(profile.stats.totalSpent)}
              </p>

              <p className="text-sm text-[#6B7280] mt-1">
                Total Spent
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 mt-6">
            <h2 className="font-semibold text-lg mb-5">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/orders"
                className="rounded-2xl border border-[#E5E5E5] p-5 hover:bg-[#F8F8F8] transition"
              >
                <ShoppingBag size={22} />
                <p className="mt-3 font-medium">
                  My Orders
                </p>
              </Link>

              <Link
                href="/wishlist"
                className="rounded-2xl border border-[#E5E5E5] p-5 hover:bg-[#F8F8F8] transition"
              >
                <Heart size={22} />
                <p className="mt-3 font-medium">
                  Wishlist
                </p>
              </Link>

              <Link
                href="/addresses"
                className="rounded-2xl border border-[#E5E5E5] p-5 hover:bg-[#F8F8F8] transition"
              >
                <MapPin size={22} />
                <p className="mt-3 font-medium">
                  Addresses
                </p>
              </Link>

              <Link
                href="/settings"
                className="rounded-2xl border border-[#E5E5E5] p-5 hover:bg-[#F8F8F8] transition"
              >
                <Settings size={22} />
                <p className="mt-3 font-medium">
                  Settings
                </p>
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 mt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">
                Recent Orders
              </h2>

              <Link
                href="/orders"
                className="text-sm font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight size={16} />
              </Link>
            </div>

            {profile.user.orders.length === 0 ? (
              <div className="text-center py-10 text-[#6B7280]">
                No orders yet.
              </div>
            ) : (
              <div className="space-y-4">
                {profile.user.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                  >
                    <div className="rounded-2xl border border-[#E5E5E5] p-5 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            Order #{order.id.slice(0, 8)}
                          </p>

                          <p className="text-sm text-[#6B7280] mt-1">
                            {new Date(
                              order.placedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold">
                            ₹{order.totalAmount}
                          </p>

                          <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Address */}
          {defaultAddress && (
            <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 mt-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-lg">
                  Default Address
                </h2>

                <button className="text-sm font-medium">
                  Edit
                </button>
              </div>

              <div className="space-y-1 text-[#374151]">
                <p className="font-medium">
                  {defaultAddress.addressLine1}
                </p>

                <p>
                  {defaultAddress.city},{" "}
                  {defaultAddress.state}
                </p>

                <p>
                  {defaultAddress.postalCode}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
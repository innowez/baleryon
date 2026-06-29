"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, ShoppingBag, Heart, MapPin, Settings, ChevronRight, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchProfile } from "@/lib/profileApi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import type { UserProfile } from "@/types/profile";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <>
      <AnnouncementBar />
      <Header variant="solid" />
      <main className="pt-[calc(2.5rem+4rem)] pb-24 md:pb-12 min-h-screen">
        <div className="container-max max-w-4xl">{children}</div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );

  if (loading) return (
    <Wrapper>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    </Wrapper>
  );

  if (!profile) return (
    <Wrapper>
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#6B7280] tracking-widest uppercase">
        Profile not found
      </div>
    </Wrapper>
  );

  const initials = getInitials(profile.user.fullName);
  const defaultAddress = profile.user.addresses?.[0];

  return (
    <Wrapper>

      {/* ── Identity strip ── */}
      <div className="relative border-b border-[#E5E5E5] pb-10 mb-10 overflow-hidden">
        {/* Ghost monogram */}
        <span
          className="absolute right-0 top-0 text-[9rem] font-bold tracking-tight leading-none select-none pointer-events-none text-black opacity-[0.04]"
          aria-hidden="true"
        >
          {initials}
        </span>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-medium tracking-tight leading-tight">
                {profile.user.fullName}
              </h1>
              <div className="flex flex-col gap-0.5 mt-2">
                <span className="text-xs text-[#6B7280]">{profile.user.email}</span>
                <span className="text-xs text-[#6B7280]">{profile.user.phone || "No phone number"}</span>
              </div>
            </div>
          </div>

          <button className="self-start sm:self-auto text-[11px] font-medium tracking-[0.12em] uppercase border border-[#0F0F0F] px-5 py-2.5 hover:bg-[#0F0F0F] hover:text-white transition-colors rounded-none">
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 border border-[#E5E5E5] divide-x divide-[#E5E5E5] mb-10">
        {[
          { value: profile.stats.totalOrders, label: "Total Orders" },
          { value: profile.stats.wishlistItems, label: "Wishlist" },
          { value: `₹${Math.round(profile.stats.totalSpent).toLocaleString()}`, label: "Total Spent" },
        ].map(({ value, label }) => (
          <div key={label} className="px-5 py-6">
            <div className="text-3xl sm:text-4xl font-medium tracking-tight leading-none">{value}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#6B7280] mt-2">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="mb-10">
        <SectionHeader title="Account" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#E5E5E5]">
          {[
            { href: "/orders", icon: ShoppingBag, label: "Orders", sub: "Track & return" },
            { href: "/wishlist", icon: Heart, label: "Wishlist", sub: "Saved items" },
            { href: "/addresses", icon: MapPin, label: "Addresses", sub: "Manage delivery" },
            // { href: "/settings", icon: Settings, label: "Settings", sub: "Preferences" },
          ].map(({ href, icon: Icon, label, sub }) => (
            <Link
              key={href}
              href={href}
              className="bg-white flex flex-col gap-3 p-5 hover:bg-[#F8F8F8] transition-colors"
            >
              <Icon size={18} strokeWidth={1.6} className="text-[#6B7280]" />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="mb-10">
        <SectionHeader title="Recent Orders" action={<Link href="/orders" className="text-[11px] text-[#6B7280] hover:text-black flex items-center gap-1 transition-colors">View all <ArrowRight size={11} /></Link>} />

        {profile.user.orders.length === 0 ? (
          <p className="text-[11px] uppercase tracking-widest text-[#6B7280] py-8 text-center">No orders yet</p>
        ) : (
          <div className="flex flex-col gap-px bg-[#E5E5E5]">
            {profile.user.orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="bg-white px-5 py-4 flex items-center justify-between hover:bg-[#F8F8F8] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{order.totalAmount.toLocaleString()}</p>
                  <span className="inline-block text-[10px] uppercase tracking-[0.1em] border border-[#E5E5E5] px-2 py-0.5 mt-1 text-[#6B7280]">
                    {order.orderStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Default Address ── */}
      {defaultAddress && (
        <div className="mb-10">
          <SectionHeader title="Default Address" action={<button className="text-[11px] text-[#6B7280] hover:text-black transition-colors">Edit</button>} />
          <div className="flex flex-col gap-1 py-4">
            <p className="text-sm">{defaultAddress.addressLine1}</p>
            <p className="text-sm text-[#6B7280]">{defaultAddress.city}, {defaultAddress.state}</p>
            <p className="text-sm text-[#6B7280]">{defaultAddress.postalCode}</p>
          </div>
        </div>
      )}

    </Wrapper>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#E5E5E5]">
      <span className="text-[10px] uppercase tracking-[0.16em] text-[#6B7280]">{title}</span>
      {action}
    </div>
  );
}
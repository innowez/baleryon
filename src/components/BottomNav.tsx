"use client";

import Link from "next/link";
import { Home, Search, Heart, ShoppingBag, User, Package, } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";

export function BottomNav() {
  const [activeTab, setActiveTab] = useState("home");
  const { totalItems: cartCount } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();

  const wishlistCount = getWishlistCount();

  const navItems = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    { id: "Products", icon: Package, label: "Products", href: "/products" },
    { id: "wishlist", icon: Heart, label: "Wishlist", href: "#", badge: wishlistCount },
    { id: "cart", icon: ShoppingBag, label: "Cart", href: "#", badge: cartCount },
    { id: "profile", icon: User, label: "Profile", href: "#" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-[#E5E5E5] z-40">
      <div className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all active:scale-95 touch-manipulation"
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={`transition-colors ${
                    isActive ? "text-[#0F0F0F] fill-[#0F0F0F]" : "text-[#6B7280]"
                  }`}
                />

                {/* Badge */}
                {/* {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )} */}
              </div>

              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? "text-[#0F0F0F]" : "text-[#6B7280]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

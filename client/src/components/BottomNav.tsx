"use client";

import Link from "next/link";
import { Home, Search, Heart, ShoppingBag, User, Package, LucideIcon } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CartDialog } from "./CartDialog";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const { totalItems: cartCount } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();

  const wishlistCount = getWishlistCount();

  const navItems: Array<{
    id: string;
    icon: LucideIcon;
    label: string;
    href: string;
    badge?: number;
    onClick?: () => void;
  }> = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    { id: "products", icon: Package, label: "Products", href: "/products" },
    { id: "wishlist", icon: Heart, label: "Wishlist", href: "/wishlist", badge: wishlistCount },
    { id: "cart", icon: ShoppingBag, label: "Cart", href: "#", badge: cartCount, onClick: () => setCartDialogOpen(true) },
    { id: "profile", icon: User, label: "Profile", href: "/profile" },
  ];

  const getActiveTab = () => {
    if (pathname === "/") return "home";
    if (pathname === "/products") return "products";
    if (pathname === "/wishlist") return "wishlist";
    if (pathname === "/profile") return "profile";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-[#E5E5E5] z-40">
        <div className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const handleClick = (e: React.MouseEvent) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
            };

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={handleClick}
                className="relative flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all active:scale-95 touch-manipulation"
              >
                <div className="relative">
                  <Icon
                    size={24}
                    className={`transition-colors ${
                      isActive ? "text-[#0F0F0F]" : "text-[#6B7280]"
                    }`}
                  />

                  {/* Badge - Only show if count > 0 */}
                  {(item.badge !== undefined) && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
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

      <CartDialog isOpen={cartDialogOpen} onClose={() => setCartDialogOpen(false)} />
    </>
  );
}

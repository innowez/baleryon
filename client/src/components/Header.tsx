"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  LogIn,
  UserPlus,
  User,
  ChevronDown,
  Heart,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoggedIn, user, logout } = useAuthStore();
  const { totalItems: cartCount } = useCartStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const iconColor = isScrolled ? "text-[#0F0F0F]" : "text-white";
  const topPosition = isScrolled ? "top-0" : "top-10";
  const bgClass = isScrolled
    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E5E5E5]"
    : "bg-transparent";

  const bgClassLogo = isScrolled ? "/baleryon_logo.png" : "/baleryonWhite.png";

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${topPosition} ${bgClass}`}
    >
      <div className="container-max">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src={`${bgClassLogo}`}
              alt="BALERYON"
              width={`${isScrolled ? "78" : "100"}`}
              height={`${isScrolled ? "78" : "100"}`}
              className={`object-contain`}
            />
            <span
              className={`font-bold text-base sm:text-lg tracking-tight transition-colors ${iconColor}`}
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              {/* BALERYON */}
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search — always visible */}
            <button
              aria-label="Search"
              className={`p-2.5 rounded-xl transition-colors touch-manipulation ${
                isScrolled
                  ? "hover:bg-[#F5F5F5] text-[#0F0F0F]"
                  : "hover:bg-white/20 text-white"
              }`}
            >
              <Search size={20} strokeWidth={1.8} />
            </button>
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className={`p-2.5 rounded-xl transition-colors ${
                  isScrolled
                    ? "hover:bg-[#F5F5F5] text-[#0F0F0F]"
                    : "hover:bg-white/20 text-white"
                }`}
              >
                <Heart size={20} strokeWidth={1.8} />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label="Cart"
                className={`relative p-2.5 rounded-xl transition-colors ${
                  isScrolled
                    ? "hover:bg-[#F5F5F5] text-[#0F0F0F]"
                    : "hover:bg-white/20 text-white"
                }`}
              >
                <ShoppingBag size={20} strokeWidth={1.8} />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              {/* Desktop auth — hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2 ml-1">
                {isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        isScrolled
                          ? "bg-[#0F0F0F] text-white hover:bg-[#0F0F0F]/90"
                          : "bg-white text-[#0F0F0F] hover:bg-white/90"
                      }`}
                    >
                      <User size={16} />
                      {user?.name || "Account"}
                      <ChevronDown size={14} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-[#E5E5E5] py-2 z-50">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F5F5F5]"
                        >
                          <User size={16} />
                          My Profile
                        </Link>

                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F5F5F5]"
                        >
                          <ShoppingBag size={16} />
                          My Orders
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                        isScrolled
                          ? "text-[#0F0F0F] hover:bg-[#F5F5F5]"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      <LogIn size={16} />
                      Login
                    </Link>

                    <Link
                      href="/signup"
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        isScrolled
                          ? "bg-[#0F0F0F] text-white hover:bg-[#0F0F0F]/90"
                          : "bg-white text-[#0F0F0F] hover:bg-white/90"
                      }`}
                    >
                      <UserPlus size={16} />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
              {/* {isLoggedIn ? (
                <button
                  onClick={() => logout()}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    isScrolled
                      ? "bg-[#0F0F0F] text-white hover:bg-[#0F0F0F]/90"
                      : "bg-white text-[#0F0F0F] hover:bg-white/90"
                  }`}
                >
                  <User size={16} />
                  Account
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                      isScrolled
                        ? "text-[#0F0F0F] hover:bg-[#F5F5F5]"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      isScrolled
                        ? "bg-[#0F0F0F] text-white hover:bg-[#0F0F0F]/90"
                        : "bg-white text-[#0F0F0F] hover:bg-white/90"
                    }`}
                  >
                    <UserPlus size={16} />
                    Sign Up
                  </Link>
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useLandingStore } from "@/store/landingStore";

export function Hero() {
  const [isScrolled, setIsScrolled] = useState(false);

  const { banner, getBanner, loading } = useLandingStore();

  useEffect(() => {
    getBanner();
  }, [getBanner]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (loading && !banner) {
    return (
      <section className="h-[100svh] w-full bg-black animate-pulse" />
    );
  }

  return (
    <section className="relative w-full h-[82svh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={
            banner?.imageUrl ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80"
          }
          alt={banner?.mainContent || "Hero Banner"}
          fill
          priority
          className="object-cover object-center"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        {/* Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-max flex flex-col items-start justify-end h-full pb-20 sm:pb-24 md:justify-center md:pb-0 max-w-3xl">
        {/* Top Content */}
        {banner?.topContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-4 sm:mb-5">
              <span className="w-5 h-px bg-white/50" />
              {banner.topContent}
            </span>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="heading-hero text-white mb-4 sm:mb-5"
        >
          {banner?.mainContent
            ?.split("\n")
            .map((line, index) => (
              <div key={index}>{line}</div>
            )) || (
            <>
              BREAK
              <br />
              THE
              <br />
              RULES
            </>
          )}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-sm sm:text-base md:text-lg text-white/80 mb-7 sm:mb-8 max-w-xs sm:max-w-md leading-relaxed"
        >
          {banner?.lastContent ||
            "Premium streetwear for the modern generation."}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Link
            href={banner?.shopNowLink || "/products"}
            className="button-primary bg-white text-[#0F0F0F] hover:bg-white/95 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Shop Now
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
        animate={{
          y: isScrolled ? [0, 0] : [0, 8, 0],
          opacity: isScrolled ? 0 : 1,
        }}
        transition={{
          duration: isScrolled ? 0 : 2,
          repeat: isScrolled ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-5 h-9 border border-white/40 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1 h-1.5 bg-white rounded-full" />
        </div>

        <span className="text-[10px] text-white/40 uppercase tracking-widest">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
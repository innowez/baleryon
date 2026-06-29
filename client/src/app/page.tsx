"use client";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { NewArrivals } from "@/components/NewArrivals";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { BestSellers } from "@/components/BestSellers";
import { EditorialLookbook } from "@/components/EditorialLookbook";
import { InstagramGrid } from "@/components/InstagramGrid";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <Hero />
      <TrustStrip />
      <CategoryGrid />
      <NewArrivals />
      <PromotionalBanner />
      <BestSellers />
      {/* <EditorialLookbook /> */}
      <InstagramGrid />
      <Newsletter />
      <Footer />
      <BottomNav />
    </>
  );
}

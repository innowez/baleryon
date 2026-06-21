"use client";

// import Image from "next/image";
// import Link from "next/link";
// import { motion } from "motion/react";
// import { ArrowRight, Timer } from "lucide-react";
import { useEffect } from "react";
import { useLandingStore } from "@/store/landingStore";
import { PromotionalBannerContent } from "./PromotionalBannerContent";

// import { useCountdown } from "@/hooks/useCountdown";
// import { useLimitedSeasonStore } from "@/stores/limitedSeasonStore";

export function PromotionalBanner() {
  const {
    season,
    loading,
    error,
    getSeason,
  } = useLandingStore();

  useEffect(() => {
    getSeason();
  }, [getSeason]);

  if (loading) {
    return (
      <section className="py-14 sm:py-20">
        <div className="container-max">
          <div className="h-[500px] rounded-3xl bg-gray-200 animate-pulse" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-14 sm:py-20">
        <div className="container-max">
          <div className="rounded-3xl border border-red-200 p-8 text-center">
            <p className="text-red-500">{error}</p>

            <button
              onClick={getSeason}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!season) {
    return null;
  }

  console.log(season,"seasonseasonseasonseasonseasonseasonseasonseason");
  

  const targetDate = new Date(
    new Date(season.updatedAt).getTime() +
      season.timeCountingHours * 60 * 60 * 1000
  );

  return (
    <PromotionalBannerContent
      season={season}
      targetDate={targetDate}
    />
  );
}
import { useCountdown } from "@/hook/useCountdown";
import { LimitedSeason } from "@/types/landinTypes";
import Link from "next/link";
import { ArrowRight, Timer } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";


export function PromotionalBannerContent({
  season,
  targetDate,
}: {
  season: LimitedSeason;
  targetDate: Date;
}) {
  const countdown = useCountdown(targetDate);

  const timerItems = [
    {
      val: countdown.days,
      label: "Days",
    },
    {
      val: countdown.hours,
      label: "Hours",
    },
    {
      val: countdown.minutes,
      label: "Mins",
    },
    {
      val: countdown.seconds,
      label: "Secs",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <div className="container-max">
        <div className="relative rounded-3xl overflow-hidden bg-[#0F0F0F]">

          <div className="absolute inset-0">
            <Image
              src={
                season.backgroundImageUrl ||
                "/images/banner-placeholder.jpg"
              }
              alt={season.mainContent || "Promotion"}
              fill
              className="object-cover opacity-30"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 p-8 sm:p-10 md:p-14 space-y-5"
            >
              <div className="flex items-center gap-2 text-[#FF3B30]">
                <Timer size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Limited Time Drop
                </span>
              </div>

              <h2 className="heading-section text-white">
                {season.mainContent}
              </h2>

              <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-sm">
                {season.description}
              </p>

              <div className="flex gap-3">
                {timerItems.map((item) => (
                  <div
                    key={item.label}
                    className="text-center"
                  >
                    <div className="bg-white/10 border border-white/20 text-white font-bold text-lg sm:text-2xl w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-xl">
                      {item.val}
                    </div>

                    <p className="text-[10px] text-white/50 mt-1 uppercase">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href={season.ctaLink || "/shop"}
                className="inline-flex items-center gap-2 bg-white text-[#0F0F0F] font-semibold px-6 py-3 rounded-xl hover:bg-[#F5F5F5]"
              >
                Explore Collection
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
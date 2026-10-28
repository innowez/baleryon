
"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { useLandingStore } from "@/store/landingStore";

export function EditorialLookbook() {
  const {
    urbanStories,
    loading,
    error,
    getUrbanStories,
  } = useLandingStore();

  useEffect(() => {
    getUrbanStories();
  }, [getUrbanStories]);

  console.log(urbanStories,"urbanStoriesurbanStoriesurbanStoriesurbanStoriesurbanStories");
  
  if (loading && urbanStories.length === 0) {
    return (
      <section className="py-14 sm:py-20 bg-white">
        <div className="container-max">
          <span className="section-label">The Lookbook</span>
          <h2 className="heading-section mb-6 sm:mb-10">
            URBAN STORIES
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && urbanStories.length === 0) {
    return (
      <section className="py-14 sm:py-20 bg-white">
        <div className="container-max text-center">
          <p className="text-red-500">{error}</p>

          <button
            onClick={getUrbanStories}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!urbanStories.length) {
    return null;
  }

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-6 sm:mb-10"
        >
          <div>
            <span className="section-label">
              The Lookbook
            </span>
            <h2 className="heading-section">
              URBAN STORIES
            </h2>
          </div>

          <Link
            href="/urban-stories"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:text-[#FF3B30] transition-colors"
          >
            View All <ArrowRight size={15} />
          </Link>
        </motion.div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:overflow-visible">
          {urbanStories.map((item, idx) => {
            const content = (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.06,
                }}
                className="relative flex-shrink-0 w-[72vw] sm:w-auto aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group snap-start"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.category}
                    fill
                    sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-200" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/30 tracking-wide">
                  Lookbook
                </div>

                <div className="absolute inset-0 flex flex-col items-start justify-end p-4 z-10">
                  <h3 className="text-white font-bold text-base sm:text-lg leading-tight mb-1">
                    {item.category}
                  </h3>

                  <span className="flex items-center gap-1 text-white/70 text-xs font-medium group-hover:text-white group-hover:gap-2 transition-all duration-300">
                    Explore <ArrowRight size={11} />
                  </span>
                </div>
              </motion.div>
            );

            return item.ctaLink ? (
              <Link
                key={item.id}
                href={item.ctaLink}
                className="block min-w-0"
              >
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>

        <div className="flex justify-center mt-5 sm:hidden">
          <Link
            href="/urban-stories"
            className="flex items-center gap-1.5 text-sm font-semibold border border-[#E5E5E5] px-5 py-2.5 rounded-xl hover:bg-[#F5F5F5] active:scale-95 transition-all"
          >
            View Full Lookbook <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

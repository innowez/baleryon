"use client";

import Image from "next/image";
import { Heart, MessageCircle, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
// import { useEffect } from "react";
// import { useLandingStore } from "@/store/landingStore";

const posts = [
  {
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80",
    likes: "2.4K",
    comments: "128",
  },
  {
    image:
      "https://images.unsplash.com/photo-1493381070836-27bcf41bc55f?w=500&q=80",
    likes: "3.1K",
    comments: "245",
  },
  {
    image:
      "https://images.unsplash.com/photo-1532453288759-924cdbb24744?w=500&q=80",
    likes: "2.8K",
    comments: "167",
  },
  {
    image:
      "https://images.unsplash.com/photo-1525887041571-fd5e66cdc94f?w=500&q=80",
    likes: "3.5K",
    comments: "301",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
    likes: "2.9K",
    comments: "189",
  },
  {
    image:
      "https://images.unsplash.com/photo-1485527093519-f21cdc6f0212?w=500&q=80",
    likes: "4.2K",
    comments: "412",
  },
];

export function InstagramGrid() {
  // const { instagramPosts } = useLandingStore();

  // useEffect(() => {
  //   getInstagramPosts();
  // }, []);

  return (
    <section className="py-14 sm:py-20 bg-[#F8F8F8]">
      <div className="container-max">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-10"
        >
          <span className="section-label">Instagram</span>
          <h2 className="heading-section mb-2">FOLLOW THE MOVEMENT</h2>
          <a
            href="https://www.instagram.com/thebaleryon/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0F0F0F] transition-colors font-medium"
          >
            @baleryon <ExternalLink size={13} />
          </a>
        </motion.div>

        {/* Mobile: horizontal scroll; Desktop: 3-col grid */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-3">
          {posts.map((post, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className="relative flex-shrink-0 w-[72vw] sm:w-auto aspect-square rounded-2xl overflow-hidden cursor-pointer group snap-start"
            >
              <Image
                src={post.image}
                alt="Instagram post"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                {/* Instagram icon */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  className="mb-1"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1.5"
                    fill="white"
                    stroke="none"
                  />
                </svg>

                <div className="flex items-center gap-5 text-white">
                  <div className="flex items-center gap-1.5">
                    <Heart size={18} fill="white" />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle size={18} />
                    <span className="text-sm font-semibold">
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile: always show stats as subtle bottom bar */}
              <div className="sm:hidden absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 flex items-center gap-3 text-white">
                <div className="flex items-center gap-1">
                  <Heart size={13} fill="white" />
                  <span className="text-[11px] font-medium">{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={13} />
                  <span className="text-[11px] font-medium">
                    {post.comments}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Follow button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-7"
        >
          <a
            href="https://www.instagram.com/thebaleryon/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0F0F0F] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-black/80 active:scale-95 transition-all touch-manipulation"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
            </svg>
            Follow @baleryon
          </a>
        </motion.div>
      </div>
    </section>
  );
}

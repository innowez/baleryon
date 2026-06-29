"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Users } from "lucide-react";
import { useLandingStore } from "@/store/landingStore";

export function Newsletter() {
  const [email, setEmail] = useState("");
  // const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { subscribe, loading, success, error } = useLandingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    await subscribe(email);

    setEmail("");
  };

  return (
    <section className="py-16 sm:py-24 bg-[#0F0F0F] text-white relative overflow-hidden">
      {/* Subtle background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center"
        >
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Users size={13} />
            Join 50,000+ members getting early access
          </div>

          <h2
            className="heading-section text-white mb-3"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            JOIN THE COMMUNITY
          </h2>
          <p className="text-sm sm:text-base text-white/60 mb-8 leading-relaxed">
            Get early access to new drops, exclusive offers, and style guides
            before anyone else.
          </p>

          {/* Form — always stacks vertically on mobile */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div
              className={`relative flex-1 rounded-xl border transition-all duration-200 ${
                isFocused ? "border-white/50" : "border-white/20"
              }`}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your email address"
                className="w-full px-5 py-4 bg-white/8 text-white placeholder:text-white/40 outline-none rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.06)" }}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 py-4 bg-white text-[#0F0F0F] font-semibold rounded-xl hover:bg-white/95 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? (
                "Subscribing..."
              ) : (
                <>
                  Subscribe Now
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </form>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-red-400 font-medium"
            >
              {error}
            </motion.p>
          )}
          <p className="mt-4 text-[11px] text-white/30">
            No spam ever. Unsubscribe anytime.
          </p>

          {success && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-[#16A34A] font-medium"
            >
              🎉 Welcome aboard! Exclusive drop notifications incoming.
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

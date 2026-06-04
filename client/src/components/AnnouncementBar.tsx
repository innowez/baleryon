"use client";

import { useEffect, useRef, useState } from "react";

const messages = [
  "🚚  Free Shipping Above ₹999",
  "✦  Easy 30-Day Returns",
  "⚡  New Collection Live Now",
  "💳  Secure UPI & Card Payments",
  "🎁  Members Get Early Access",
];

export function AnnouncementBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let start: number | null = null;
    const speed = 0.4; // px per ms
    let raf: number;
    let offset = 0;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const half = track.scrollWidth / 2;
      offset = ((timestamp - start) * speed) % half;
      track.style.transform = `translateX(-${offset}px)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY === 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const doubled = [...messages, ...messages];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F] text-white py-2.5 overflow-hidden transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {doubled.map((msg, idx) => (
          <span
            key={idx}
            className="text-[11px] sm:text-xs font-medium px-6 tracking-wide inline-flex items-center gap-1"
          >
            {msg}
            <span className="ml-6 text-white/30">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

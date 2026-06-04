"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Share2, X, Globe, ChevronDown, ArrowUp } from "lucide-react";
import { useState } from "react";

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Shop: [
    { label: "New Arrivals", href: "#" },
    { label: "Men", href: "#" },
    { label: "Sale", href: "#" },
    { label: "Collections", href: "#" },
  ],
  Help: [
    { label: "Contact Us", href: "#" },
    { label: "Shipping Info", href: "#" },
    { label: "Returns", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Size Guide", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
    { label: "Sustainability", href: "#" },
  ],
};

const socials = [
  { icon: Share2, href: "#", label: "Instagram" },
  { icon: X, href: "#", label: "Twitter / X" },
  { icon: Globe, href: "#", label: "YouTube" },
];

function AccordionSection({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left touch-manipulation"
      >
        <span className="text-sm font-semibold text-white">{title}</span>
        <ChevronDown size={16} className={`text-white/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-64 pb-4" : "max-h-0"}`}>
        <ul className="space-y-2.5">
          {links.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#0F0F0F] text-white pb-20 md:pb-0">
      {/* Back to top */}
      <div className="border-b border-white/10">
        <button
          onClick={scrollToTop}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-xs text-white/40 hover:text-white transition-colors touch-manipulation"
        >
          <ArrowUp size={13} /> Back to Top
        </button>
      </div>

      <div className="container-max py-10 sm:py-16">
        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-plus-jakarta)" }}>BALERYON</h3>
              <p className="text-sm text-white/60 leading-relaxed">Premium streetwear for the modern generation.</p>
            </div>
            <div className="space-y-3 text-sm">
              <a href="mailto:hello@baleryon.com" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                <Mail size={16} /> hello@baleryon.com
              </a>
              <a href="tel:+91-9000000000" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                <Phone size={16} /> +91 90000 00000
              </a>
              <div className="flex items-start gap-3 text-white/60">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>Mumbai, India</span>
              </div>
            </div>
            <div className="flex gap-2.5">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.label} href={s.href} aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
                    <Icon size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-white/40">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile: brand + accordion */}
        <div className="md:hidden">
          <div className="mb-6 pb-6 border-b border-white/10">
            <h3 className="text-lg font-bold mb-1.5" style={{ fontFamily: "var(--font-plus-jakarta)" }}>BALERYON</h3>
            <p className="text-sm text-white/50 mb-4">Premium streetwear for the modern generation.</p>
            <div className="flex gap-2.5">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.label} href={s.href} aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all">
                    <Icon size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <AccordionSection key={category} title={category} links={links} />
          ))}
          <div className="mt-6 space-y-2.5">
            <a href="mailto:hello@baleryon.com" className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors">
              <Mail size={15} /> hello@baleryon.com
            </a>
            <a href="tel:+91-9000000000" className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors">
              <Phone size={15} /> +91 90000 00000
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 mt-8 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/40">© {currentYear} BALERYON. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            {["Privacy Policy", "Terms of Service", "Cookies", "Sitemap"].map((p) => (
              <Link key={p} href="#" className="hover:text-white transition-colors">{p}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Payment bar */}
      <div className="border-t border-white/10 bg-white/5 py-4">
        <div className="container-max flex flex-wrap items-center justify-center gap-4 text-[11px] text-white/40">
          <span>We Accept:</span>
          <span>💳 Card</span>
          <span>📱 UPI</span>
          <span>🏦 Net Banking</span>
          <span>💰 Wallets</span>
          <span>🛍️ BNPL</span>
        </div>
      </div>
    </footer>
  );
}

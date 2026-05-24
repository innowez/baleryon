"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbsProps = {
  category?: string;
};

export function Breadcrumbs({ category }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 mb-6 text-sm">
      <Link href="/" className="text-[#6B7280] hover:text-[#0F0F0F] transition-colors">
        Home
      </Link>
      <ChevronRight size={16} className="text-[#E5E5E5]" />
      <span className="text-[#6B7280]">Men</span>
      {category && (
        <>
          <ChevronRight size={16} className="text-[#E5E5E5]" />
          <span className="text-[#0F0F0F] font-semibold">{category}</span>
        </>
      )}
    </nav>
  );
}

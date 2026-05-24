"use client";

import Link from "next/link";
import { getProductsByCategory } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

export default function RelatedProducts({
  currentProductId,
  category,
}: RelatedProductsProps) {
  const relatedProducts = getProductsByCategory(category)
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F0F0F]">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {relatedProducts.map((product, idx) => (
          <Link key={product.id} href={`/products/${product.id}`} className="block">
            <ProductCard product={product} index={idx} />
          </Link>
        ))}
      </div>
    </div>
  );
}

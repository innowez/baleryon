"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { fetchRelatedShopProducts } from "@/lib/productsApi";
import type { Product } from "@/types/product";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

export default function RelatedProducts({
  currentProductId,
  category,
}: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const products = await fetchRelatedShopProducts(
          category,
          currentProductId,
          4
        );
        if (!cancelled) setRelatedProducts(products);
      } catch {
        if (!cancelled) setRelatedProducts([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category, currentProductId]);

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

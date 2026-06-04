function decimalToNumber(value) {
  if (value == null) return null;
  return typeof value === "object" && "toNumber" in value
    ? value.toNumber()
    : Number(value);
}

export function getEffectivePrice(product) {
  const base = decimalToNumber(product.basePrice) ?? 0;
  const sale = decimalToNumber(product.salePrice);
  if (sale != null && sale > 0 && sale < base) return sale;
  return base;
}

export function getOriginalPrice(product) {
  return decimalToNumber(product.basePrice) ?? 0;
}

function uniqueVariantValues(variants, field) {
  const seen = new Set();
  const values = [];
  for (const variant of variants || []) {
    const raw = variant[field];
    if (!raw) continue;
    const key = String(raw).trim();
    if (!key || seen.has(key.toLowerCase())) continue;
    seen.add(key.toLowerCase());
    values.push(key);
  }
  return values;
}

function computeReviewStats(reviews) {
  if (!reviews?.length) {
    return { rating: 0, reviews: 0 };
  }
  const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  return {
    rating: Math.round((total / reviews.length) * 10) / 10,
    reviews: reviews.length,
  };
}

/** Map Prisma product (with relations) to storefront Product shape */
export function toShopProduct(product) {
  const images = (product.images || []).map((img) => img.imageUrl);
  const { rating, reviews } = computeReviewStats(product.reviews);
  const variants = product.variants || [];
  const inStock = variants.some((v) => (v.stock ?? 0) > 0);

  return {
    id: product.id,
    name: product.title,
    category: product.category?.name || "Uncategorized",
    price: getEffectivePrice(product),
    originalPrice: getOriginalPrice(product),
    image: images[0] || "",
    image2: images[1] || images[0] || "",
    images: images,
    rating,
    reviews,
    description: product.description || product.shortDescription || "",
    sizes: uniqueVariantValues(variants, "size"),
    colors: uniqueVariantValues(variants, "color"),
    inStock,
    slug: product.slug,
    gender: product.gender,
  };
}

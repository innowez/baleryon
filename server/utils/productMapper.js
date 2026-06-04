function decimalToNumber(value) {
  if (value == null) return null;
  return typeof value === "object" && "toNumber" in value
    ? value.toNumber()
    : Number(value);
}

/** Map Prisma product (with relations) to legacy Mongo-style shape for the admin UI */
export function toLegacyProduct(product) {
  const basePrice = decimalToNumber(product.basePrice) ?? 0;
  const salePrice = decimalToNumber(product.salePrice);
  const discountPercent = decimalToNumber(product.discountPercent);

  let discount = discountPercent;
  if (discount == null && salePrice != null && basePrice > 0) {
    discount = Math.round((1 - salePrice / basePrice) * 100);
  }

  const variants = product.variants || [];
  const sizeMap = new Map();
  for (const variant of variants) {
    const size = variant.size || "";
    if (!size) continue;
    if (!sizeMap.has(size)) {
      sizeMap.set(size, {
        size,
        quantity: variant.stock ?? 0,
      });
    }
  }
  const colorMap = new Map();
  for (const variant of variants) {
    if (!variant.color) continue;
    const key = `${variant.color}|${variant.colorHex || ""}`;
    if (!colorMap.has(key)) {
      colorMap.set(key, {
        name: variant.color,
        hex: variant.colorHex || null,
      });
    }
  }
  const productColors = Array.from(colorMap.values());
  const defaultColor = productColors[0]?.name || "";

  return {
    _id: product.id,
    productName: product.title,
    description: product.description || "",
    price: basePrice,
    discount: discount ?? 0,
    category: product.category
      ? { id: product.category.id, name: product.category.name }
      : { name: "" },
    brand: product.brand
      ? { id: product.brand.id, name: product.brand.name }
      : null,
    note: product.note || product.shortDescription || "",
    sizes: Array.from(sizeMap.values()),
    color: defaultColor,
    colors: productColors,
    productDetails: product.description || "",
    isReturn: product.isReturnable ?? false,
    image: (product.images || []).map((img) => img.imageUrl),
    productImages: (product.images || []).map((img) => ({
      id: img.id,
      url: img.imageUrl,
      isPrimary: img.isPrimary,
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

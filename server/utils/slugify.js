export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function slugExists(prisma, model, candidate) {
  if (model === "category") {
    return prisma.category.findUnique({ where: { slug: candidate } });
  }
  if (model === "brand") {
    return prisma.brand.findUnique({ where: { slug: candidate } });
  }
  return prisma.product.findUnique({ where: { slug: candidate } });
}

export async function uniqueSlug(prisma, base, model = "product") {
  let slug = slugify(base);
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const exists = await slugExists(prisma, model, candidate);

    if (!exists) return candidate;
    suffix += 1;
  }
}

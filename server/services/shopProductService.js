import prisma from "../lib/prisma.js";
import {
  getEffectivePrice,
  toShopProduct,
} from "../utils/shopProductMapper.js";

const productListInclude = {
  category: true,
  variants: true,
  images: { orderBy: { sortOrder: "asc" } },
  reviews: { select: { rating: true } },
};

function parseListParam(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildPrismaWhere({ search, categories, colors, sizes, gender }) {
  const where = { isActive: true, AND: [] };

  if (gender) {
    where.AND.push({
      OR: [
        { gender: { equals: String(gender), mode: "insensitive" } },
        { gender: null },
      ],
    });
  }

  if (search?.trim()) {
    const term = search.trim();
    where.AND.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { shortDescription: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  const categoryList = parseListParam(categories);
  if (categoryList.length) {
    where.AND.push({
      category: { name: { in: categoryList, mode: "insensitive" } },
    });
  }

  const colorList = parseListParam(colors);
  if (colorList.length) {
    where.AND.push({
      variants: {
        some: { color: { in: colorList, mode: "insensitive" } },
      },
    });
  }

  const sizeList = parseListParam(sizes);
  if (sizeList.length) {
    where.AND.push({
      variants: {
        some: { size: { in: sizeList, mode: "insensitive" } },
      },
    });
  }

  if (where.AND.length === 0) {
    delete where.AND;
  }

  return where;
}

function sortProducts(products, sort) {
  const list = [...products];

  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    case "price-desc":
      return list.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    case "newest":
      return list.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case "best-rated": {
      const avg = (p) => {
        const reviews = p.reviews || [];
        if (!reviews.length) return 0;
        return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      };
      return list.sort((a, b) => avg(b) - avg(a));
    }
    case "popularity":
      return list.sort(
        (a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0)
      );
    case "relevance":
    default:
      return list;
  }
}

function applyPriceAndRatingFilters(products, { minPrice, maxPrice, rating }) {
  let result = products;

  const min = minPrice != null ? Number(minPrice) : null;
  const max = maxPrice != null ? Number(maxPrice) : null;

  if (min != null && !Number.isNaN(min)) {
    result = result.filter((p) => getEffectivePrice(p) >= min);
  }
  if (max != null && !Number.isNaN(max)) {
    result = result.filter((p) => getEffectivePrice(p) <= max);
  }

  const minRating = rating != null ? Number(rating) : 0;
  if (minRating > 0 && !Number.isNaN(minRating)) {
    result = result.filter((p) => {
      const reviews = p.reviews || [];
      if (!reviews.length) return false;
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      return avg >= minRating;
    });
  }

  return result;
}

export async function listShopProducts(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 8));
  const sort = query.sort || "relevance";

  const where = buildPrismaWhere({
    search: query.search,
    categories: query.categories,
    colors: query.colors,
    sizes: query.sizes,
    gender: query.gender || "men",
  });

  const rows = await prisma.product.findMany({
    where,
    include: productListInclude,
  });

  const filtered = applyPriceAndRatingFilters(rows, {
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    rating: query.rating,
  });

  const sorted = sortProducts(filtered, sort);
  const totalProducts = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * limit;
  const pageRows = sorted.slice(skip, skip + limit);

  return {
    products: pageRows.map(toShopProduct),
    page: safePage,
    totalPages,
    totalProducts,
    limit,
  };
}

export async function getShopProductById(id) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: productListInclude,
  });

  if (!product) return null;
  return toShopProduct(product);
}

export async function getShopFilterOptions(query = {}) {
  const where = { isActive: true };

  if (query.gender) {
    where.AND = [
      {
        OR: [
          { gender: { equals: String(query.gender), mode: "insensitive" } },
          { gender: null },
        ],
      },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true } },
      variants: { select: { color: true, colorHex: true, size: true } },
    },
  });

  const categorySet = new Set();
  const colorMap = new Map();
  const sizeSet = new Set();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const product of products) {
    if (product.category?.name) {
      categorySet.add(product.category.name);
    }

    const price = getEffectivePrice(product);
    minPrice = Math.min(minPrice, price);
    maxPrice = Math.max(maxPrice, price);

    for (const variant of product.variants || []) {
      if (variant.color) {
        const name = String(variant.color).trim();
        if (!colorMap.has(name.toLowerCase())) {
          colorMap.set(name.toLowerCase(), {
            name,
            hex: variant.colorHex || null,
          });
        }
      }
      if (variant.size) {
        sizeSet.add(String(variant.size).trim());
      }
    }
  }

  const sortSizes = (a, b) => {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    const an = Number(a);
    const bn = Number(b);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a.localeCompare(b);
  };

  return {
    categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
    colors: Array.from(colorMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    sizes: Array.from(sizeSet).sort(sortSizes),
    priceRange: {
      min: minPrice === Infinity ? 0 : Math.floor(minPrice),
      max: maxPrice === 0 ? 0 : Math.ceil(maxPrice),
    },
  };
}

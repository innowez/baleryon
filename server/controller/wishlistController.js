
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function formatWishlist(userId) {
  const entries = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!entries.length) {
    return { items: [] };
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: entries.map((entry) => entry.productId),
      },
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const productMap = new Map(
    products.map((product) => [product.id, product])
  );

  const items = entries
    .map((entry) => {
      const product = productMap.get(entry.productId);

      if (!product) return null;

      const image =
        product.images.find((img) => img.isPrimary) ??
        product.images[0];

      return {
        productId: product.id,
        slug: product.slug,
        name: product.title,
        price: Number(
          product.salePrice ?? product.basePrice
        ),
        image: image?.imageUrl ?? "",
        addedAt: entry.createdAt.getTime(),
      };
    })
    .filter(Boolean);

  return { items };
}

// GET /api/wishlist
export const getWishlistController = asyncHandler(
  async (req, res) => {
    const result = await formatWishlist(req.user.id);
    res.status(200).json(result);
  }
);

// POST /api/wishlist
// Body: { productId }
export const addWishlistController = asyncHandler(
  async (req, res) => {
    const { productId } = req.body ?? {};

    if (!UUID_RE.test(String(productId ?? ""))) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        productId,
      },
    });

    res.status(200).json(
      await formatWishlist(req.user.id)
    );
  }
);

// DELETE /api/wishlist/:productId
export const removeWishlistController = asyncHandler(
  async (req, res) => {
    const { productId } = req.params;

    if (!UUID_RE.test(String(productId ?? ""))) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    res.status(200).json(
      await formatWishlist(req.user.id)
    );
  }
);

// DELETE /api/wishlist
export const clearWishlistController = asyncHandler(
  async (req, res) => {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id },
    });

    res.status(200).json({ items: [] });
  }
);

import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const normalize = (value) => String(value ?? "").trim().toLowerCase();
const normalizeColor = (value) => {
  const color = normalize(value);
  return color === "default" ? "" : color;
};
const stockMessage = (stock) =>
  stock <= 0 ? "This item is out of stock." : `Only ${stock} available. You can't add more than ${stock}.`;
const variantSelect = {
  id: true, productId: true, size: true, color: true, colorHex: true, stock: true,
};

function selectVariant(variants, size, color) {
  return variants.find(
    (variant) => normalize(variant.size) === normalize(size) &&
      normalizeColor(variant.color) === normalizeColor(color)
  );
}

function optionsFor(variants) {
  const sizes = [...new Set(variants.map((v) => v.size).filter((v) => normalize(v)))];
  const colors = [...new Map(
    variants.filter((v) => normalizeColor(v.color)).map((v) => [
      normalizeColor(v.color), { name: v.color, hex: v.colorHex ?? null },
    ])
  ).values()];
  return { needsSize: sizes.length > 0, needsColor: colors.length > 0, sizes, colors };
}

function selectionMessage(variants, size, color) {
  const info = optionsFor(variants);
  const missing = [];
  if (info.needsSize && !normalize(size)) missing.push("size");
  if (info.needsColor && !normalizeColor(color)) missing.push("color");
  return missing.length
    ? `Please select a ${missing.join(" and ")}.`
    : "This size and color combination isn't available.";
}

function parseQuantity(value, { allowZero = false } = {}) {
  const qty = Number(value);
  return Number.isSafeInteger(qty) && (allowZero ? qty >= 0 : qty >= 1) ? qty : null;
}

async function variantsFor(productId) {
  if (!UUID_RE.test(String(productId ?? ""))) return [];
  return prisma.productVariant.findMany({ where: { productId }, select: variantSelect });
}

// PUBLIC: POST /api/cart/check-stock
// No cart rows or stock mutations happen in this endpoint.
export const checkCartStockController = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body?.items) || req.body.items.length > 50) {
    return res.status(400).json({ message: "Provide an items array with up to 50 items." });
  }
  const items = req.body.items;
  const ids = [...new Set(items.map((x) => x?.productId).filter((id) => UUID_RE.test(String(id))))];
  const variants = ids.length
    ? await prisma.productVariant.findMany({
        where: { productId: { in: ids } }, select: variantSelect,
      })
    : [];
  const byProduct = new Map();
  for (const variant of variants) {
    if (!byProduct.has(variant.productId)) byProduct.set(variant.productId, []);
    byProduct.get(variant.productId).push(variant);
  }
  return res.json({
    items: items.map((item) => {
      const productId = item?.productId ?? null;
      const size = item?.size ?? null;
      const color = item?.color ?? null;
      const available = byProduct.get(productId) ?? [];
      const variant = selectVariant(available, size, color);
      return {
        productId, size, color, found: Boolean(variant),
        stock: variant ? Math.max(0, variant.stock) : 0,
        variantId: variant?.id ?? null,
        ...optionsFor(available),
      };
    }),
  });
});

async function getOrCreateCart(userId) {
  const cart = await prisma.cart.findFirst({
    where: { userId }, orderBy: { createdAt: "asc" },
  });
  return cart ?? prisma.cart.create({ data: { userId } });
}

async function serializedCart(userId) {
  const cart = await prisma.cart.findFirst({
    where: { userId }, orderBy: { createdAt: "asc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          variant: {
            include: { product: { include: { images: { orderBy: { sortOrder: "asc" } } } } },
          },
        },
      },
    },
  });
  const items = (cart?.items ?? []).filter((item) => item.variant?.product).map((item) => {
    const variant = item.variant;
    const product = variant.product;
    const images = product.images ?? [];
    const image = images.find((i) => i.variantId === variant.id) ??
      images.find((i) => i.isPrimary) ?? images[0];
    const price = variant.salePrice ?? variant.price ?? product.salePrice ?? product.basePrice;
    return {
      id: item.id, productId: product.id, variantId: variant.id,
      slug: product.slug, name: product.title,
      price: Number(price ?? 0), image: image?.imageUrl ?? "",
      size: normalize(variant.size) ? variant.size : undefined,
      color: normalizeColor(variant.color) ? variant.color : undefined,
      quantity: item.quantity, stock: Math.max(0, variant.stock),
      needsSize: Boolean(normalize(variant.size)),
      needsColor: Boolean(normalizeColor(variant.color)),
    };
  });
  return { items };
}

async function ownItem(userId, itemId) {
  if (!UUID_RE.test(String(itemId ?? ""))) return null;
  return prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    include: { variant: { select: variantSelect } },
  });
}

export const getCartController = asyncHandler(async (req, res) => {
  res.json(await serializedCart(req.user.id));
});

export const addCartItemController = asyncHandler(async (req, res) => {
  const { productId, size, color } = req.body ?? {};
  const qty = parseQuantity(req.body?.quantity);
  if (qty === null) return res.status(400).json({ message: "Quantity must be a positive integer." });
  const variants = await variantsFor(productId);
  const variant = selectVariant(variants, size, color);
  if (!variant) return res.status(400).json({ message: selectionMessage(variants, size, color) });

  // Use a transaction to make add-or-increment atomic with respect to cart requests.
  // A unique constraint on CartItem(cartId, variantId) is strongly recommended.
  await prisma.$transaction(async (tx) => {
    let cart = await tx.cart.findFirst({
      where: { userId: req.user.id }, orderBy: { createdAt: "asc" },
    });
    if (!cart) cart = await tx.cart.create({ data: { userId: req.user.id } });
    const existing = await tx.cartItem.findFirst({
      where: { cartId: cart.id, variantId: variant.id },
    });
    const newQty = (existing?.quantity ?? 0) + qty;
    // Re-read stock within the transaction, rather than trusting the request.
    const current = await tx.productVariant.findUnique({ where: { id: variant.id }, select: { stock: true } });
    const stock = Math.max(0, current?.stock ?? 0);
    if (newQty > stock) {
      const error = new Error(stockMessage(stock));
      error.httpStatus = 409;
      throw error;
    }
    if (existing) {
      await tx.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    } else {
      await tx.cartItem.create({ data: { cartId: cart.id, variantId: variant.id, quantity: newQty } });
    }
  }).catch((error) => {
    if (error.httpStatus === 409) return res.status(409).json({ message: error.message });
    throw error;
  });
  if (res.headersSent) return;
  res.json(await serializedCart(req.user.id));
});

export const updateCartItemController = asyncHandler(async (req, res) => {
  const qty = parseQuantity(req.body?.quantity, { allowZero: true });
  if (qty === null) return res.status(400).json({ message: "Quantity must be a non-negative integer." });
  const item = await ownItem(req.user.id, req.params.id);
  if (!item) return res.status(404).json({ message: "Cart item not found." });
  if (qty === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    const current = await prisma.productVariant.findUnique({
      where: { id: item.variantId }, select: { stock: true },
    });
    const stock = Math.max(0, current?.stock ?? 0);
    if (qty > stock) return res.status(409).json({ message: stockMessage(stock) });
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: qty } });
  }
  res.json(await serializedCart(req.user.id));
});

export const removeCartItemController = asyncHandler(async (req, res) => {
  const item = await ownItem(req.user.id, req.params.id);
  if (!item) return res.status(404).json({ message: "Cart item not found." });
  await prisma.cartItem.delete({ where: { id: item.id } });
  res.json(await serializedCart(req.user.id));
});

export const clearCartController = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ items: [] });
});

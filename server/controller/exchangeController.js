// controller/exchangeController.js
//
// One-time product EXCHANGE (replacement) flow, replacing the previous
// "no return" policy. A customer who purchased an item may request, once
// per order item, a swap for a different size/color of the SAME product,
// within EXCHANGE_WINDOW_DAYS of the order being marked DELIVERED, and only
// for products the admin has flagged as returnable (`Product.isReturnable`).
//
// Every rule enforced here is re-derived from the database on every call —
// nothing about eligibility is ever trusted from the client, mirroring how
// order pricing is never trusted from the client in orderController.js.

import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

export const EXCHANGE_WINDOW_DAYS = 2;

/**
 * Loads everything needed to decide whether an order item is exchange
 * eligible right now, and why not if it isn't. Never throws for ordinary
 * "not eligible" reasons — only for truly unexpected DB errors, which the
 * caller (asyncHandler) will turn into a 500.
 */
async function evaluateEligibility(orderItemId, userId) {
  if (!orderItemId || !userId) {
    return { eligible: false, reason: "Missing order item or user" };
  }

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: true,
      product: true,
      variant: true,
    },
  });

  if (!orderItem) {
    return { eligible: false, reason: "Order item not found" };
  }

  if (!orderItem.order || orderItem.order.userId !== userId) {
    return { eligible: false, reason: "This item does not belong to you" };
  }

  if (orderItem.order.orderStatus !== "DELIVERED" || !orderItem.order.deliveredAt) {
    return {
      eligible: false,
      reason: "Exchanges can only be requested after the order is delivered",
      orderItem,
    };
  }

  const deliveredAt = new Date(orderItem.order.deliveredAt);
  const expiresAt = new Date(deliveredAt.getTime() + EXCHANGE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  if (Date.now() > expiresAt.getTime()) {
    return {
      eligible: false,
      reason: `The exchange window (${EXCHANGE_WINDOW_DAYS} days after delivery) has passed`,
      orderItem,
      deliveredAt,
      expiresAt,
    };
  }

  if (!orderItem.product || orderItem.product.isReturnable !== true) {
    return {
      eligible: false,
      reason: "This product is not eligible for exchange",
      orderItem,
      deliveredAt,
      expiresAt,
    };
  }

  const existing = await prisma.orderReturn.findFirst({
    where: { orderItemId },
  });

  if (existing) {
    return {
      eligible: false,
      reason: "An exchange has already been requested for this item",
      orderItem,
      deliveredAt,
      expiresAt,
      existing,
    };
  }

  return { eligible: true, orderItem, deliveredAt, expiresAt };
}

// @route GET /api/exchange/options/:orderItemId?userId=...
export const getExchangeOptionsController = asyncHandler(async (req, res) => {
  const { orderItemId } = req.params;
  const userId = String(req.query.userId ?? "").trim();

  const evaluation = await evaluateEligibility(orderItemId, userId);

  if (!evaluation.orderItem) {
    return res.status(404).json({ success: false, eligible: false, message: evaluation.reason });
  }

  const { orderItem } = evaluation;
  let variants = [];

  if (orderItem.productId) {
    const siblings = await prisma.productVariant.findMany({
      where: {
        productId: orderItem.productId,
        stock: { gt: 0 },
        ...(orderItem.variantId ? { id: { not: orderItem.variantId } } : {}),
      },
      orderBy: [{ color: "asc" }, { size: "asc" }],
    });

    variants = siblings.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      stock: v.stock,
    }));
  }

  return res.json({
    success: true,
    eligible: evaluation.eligible,
    message: evaluation.eligible ? null : evaluation.reason,
    windowDays: EXCHANGE_WINDOW_DAYS,
    deliveredAt: evaluation.deliveredAt ?? orderItem.order?.deliveredAt ?? null,
    expiresAt: evaluation.expiresAt ?? null,
    currentVariant: orderItem.variant
      ? { id: orderItem.variant.id, color: orderItem.variant.color, size: orderItem.variant.size }
      : null,
    variants,
  });
});

// @route POST /api/exchange
export const createExchangeRequestController = asyncHandler(async (req, res) => {
  const userId = String(req.body?.userId ?? "").trim();
  const orderItemId = String(req.body?.orderItemId ?? "").trim();
  const desiredVariantId = String(req.body?.desiredVariantId ?? "").trim();
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 500) : null;

  if (!userId || !orderItemId || !desiredVariantId) {
    return res.status(400).json({
      success: false,
      message: "userId, orderItemId and desiredVariantId are required",
    });
  }

  const evaluation = await evaluateEligibility(orderItemId, userId);

  if (!evaluation.eligible) {
    return res.status(403).json({
      success: false,
      message: evaluation.reason || "This item is not eligible for exchange",
    });
  }

  const { orderItem } = evaluation;

  if (desiredVariantId === orderItem.variantId) {
    return res.status(400).json({
      success: false,
      message: "Please select a different size or color to exchange for",
    });
  }

  const desiredVariant = await prisma.productVariant.findUnique({
    where: { id: desiredVariantId },
  });

  if (!desiredVariant || desiredVariant.productId !== orderItem.productId) {
    return res.status(400).json({
      success: false,
      message: "The selected size/color is not available for this product",
    });
  }

  if (desiredVariant.stock <= 0) {
    return res.status(409).json({
      success: false,
      message: "The selected size/color is currently out of stock",
    });
  }

  // Re-guard against a duplicate request submitted concurrently (double
  // click / double submit): the unique-per-item rule is re-checked here,
  // right before the write, not just earlier in evaluateEligibility().
  const duplicate = await prisma.orderReturn.findFirst({ where: { orderItemId } });
  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: "An exchange has already been requested for this item",
    });
  }

  const exchangeRequest = await prisma.orderReturn.create({
    data: {
      orderItemId,
      type: "EXCHANGE",
      status: "REQUESTED",
      reason,
      desiredVariantId,
    },
  });

  return res.status(201).json({ success: true, exchangeRequest });
});

// @route GET /api/exchange/order/:orderId
export const getOrderExchangeRequestsController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { id: true },
  });
  const itemIds = items.map((i) => i.id);

  if (itemIds.length === 0) {
    return res.json({ success: true, exchangeRequests: [] });
  }

  const requests = await prisma.orderReturn.findMany({
    where: { orderItemId: { in: itemIds } },
    orderBy: { createdAt: "desc" },
  });

  const variantIds = requests.map((r) => r.desiredVariantId).filter(Boolean);
  const variants = variantIds.length
    ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
    : [];
  const variantById = new Map(variants.map((v) => [v.id, v]));

  const exchangeRequests = requests.map((r) => ({
    ...r,
    desiredVariant: r.desiredVariantId
      ? {
          id: r.desiredVariantId,
          color: variantById.get(r.desiredVariantId)?.color ?? null,
          size: variantById.get(r.desiredVariantId)?.size ?? null,
        }
      : null,
  }));

  return res.json({ success: true, exchangeRequests });
});

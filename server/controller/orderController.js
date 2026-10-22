import asyncHandler from "express-async-handler";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { checkDeliveryAvailability } from "../services/delhiveryService.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ── Payment method normalization ──────────────────────────────
// The frontend may send a few different spellings for the same method
// ("razorpay", "online", "cod", "COD", "cash_on_delivery"...). Everything
// downstream (Order.paymentMethod, Payment.paymentGateway, Delhivery
// shipment payment_mode) relies on this single normalized form.
const ONLINE_PAYMENT_METHODS = new Set(["razorpay", "online", "prepaid"]);
const COD_PAYMENT_METHODS = new Set([
  "cod",
  "cash_on_delivery",
  "cash-on-delivery",
  "cashondelivery",
]);

export function normalizePaymentMethod(paymentMethod) {
  const value = String(paymentMethod ?? "").trim().toLowerCase();
  if (COD_PAYMENT_METHODS.has(value)) return "cod";
  if (ONLINE_PAYMENT_METHODS.has(value)) return "razorpay";
  return null;
}

const round2 = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Thrown for any client-facing validation failure while resolving items,
// so the controller can turn it into a clean JSON response instead of a
// raw stack trace / TypeError reaching the user.
class OrderValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "OrderValidationError";
    this.statusCode = statusCode;
  }
}

/**
 * Resolves cart items against the database and computes prices.
 *
 * The backend is the source of truth for pricing — any price sent by the
 * client is never used. Each item is resolved independently by whichever
 * id it carries (variantId OR productId), so a mixed cart (some items
 * with a variant, some without) is handled correctly instead of assuming
 * every item in the order looks like the first one.
 */
async function resolveOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderValidationError("Order must have at least one item");
  }

  const productIds = new Set();
  const variantIds = new Set();

  items.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      throw new OrderValidationError(`Invalid item at position ${index + 1}`);
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new OrderValidationError(
        `Invalid quantity for item at position ${index + 1}`,
      );
    }

    const variantId = item.variantId ? String(item.variantId) : null;
    const productId = item.productId ? String(item.productId) : null;

    if (!variantId && !productId) {
      throw new OrderValidationError(
        `Item at position ${index + 1} is missing a product reference`,
      );
    }

    if (variantId) variantIds.add(variantId);
    else productIds.add(productId);
  });

  const [variants, products] = await Promise.all([
    variantIds.size
      ? prisma.productVariant.findMany({
          where: { id: { in: [...variantIds] } },
          include: { product: true },
        })
      : Promise.resolve([]),
    productIds.size
      ? prisma.product.findMany({ where: { id: { in: [...productIds] } } })
      : Promise.resolve([]),
  ]);

  const variantMap = new Map(variants.map((v) => [v.id, v]));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItemsData = items.map((item, index) => {
    const quantity = Number(item.quantity);

    if (item.variantId) {
      const variant = variantMap.get(String(item.variantId));
      if (!variant) {
        throw new OrderValidationError("One or more variants not found");
      }
      if (!variant.product) {
        throw new OrderValidationError(
          "One or more products for the selected variants no longer exist",
        );
      }

      const rawPrice =
        variant.salePrice ??
        variant.price ??
        variant.product.salePrice ??
        variant.product.basePrice;
      const unitPrice = parseFloat(rawPrice);

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        throw new OrderValidationError(
          `No valid price is configured for "${variant.product.title}"`,
        );
      }

      return {
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.title,
        quantity,
        unitPrice,
        totalPrice: round2(unitPrice * quantity),
      };
    }

    const product = productMap.get(String(item.productId));
    if (!product) {
      throw new OrderValidationError("One or more products not found");
    }

    const rawPrice = product.salePrice ?? product.basePrice;
    const unitPrice = parseFloat(rawPrice);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new OrderValidationError(
        `No valid price is configured for "${product.title}"`,
      );
    }

    return {
      productId: product.id,
      variantId: null,
      productName: product.title,
      quantity,
      unitPrice,
      totalPrice: round2(unitPrice * quantity),
    };
  });

  const subtotal = round2(
    orderItemsData.reduce((sum, i) => sum + i.totalPrice, 0),
  );

  return { orderItemsData, subtotal };
}

/**
 * Re-validates a coupon code against the current subtotal instead of
 * trusting a client-supplied discountAmount. Mirrors the rules in
 * couponController.validateCoupon so a coupon applied at checkout-preview
 * time can't be tampered with (or have gone stale) by the time the order
 * is actually placed.
 */
async function resolveDiscount(couponCode, subtotal) {
  if (!couponCode || typeof couponCode !== "string" || !couponCode.trim()) {
    return 0;
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode.trim().toUpperCase() },
  });

  if (!coupon) {
    throw new OrderValidationError("Coupon code is invalid");
  }
  if (!coupon.isActive) {
    throw new OrderValidationError("Coupon is no longer active");
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new OrderValidationError("Coupon has expired");
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new OrderValidationError("Coupon usage limit has been reached");
  }
  if (coupon.minimumOrder && subtotal < Number(coupon.minimumOrder)) {
    throw new OrderValidationError(
      `Minimum order of ₹${coupon.minimumOrder} required for this coupon`,
    );
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? (subtotal * Number(coupon.value)) / 100
      : Number(coupon.value);

  return round2(Math.min(Math.max(discount, 0), subtotal));
}

export const createOrderController = asyncHandler(async (req, res) => {
  const { userId, addressId, items, paymentMethod, couponCode } = req.body;

  // ── Basic request validation ────────────────────────────────
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Please sign in to place an order" });
  }

  if (!addressId) {
    return res.status(400).json({ message: "A delivery address is required" });
  }

  const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
  if (!normalizedPaymentMethod) {
    return res.status(400).json({
      message: 'paymentMethod must be either "razorpay" or "cod"',
    });
  }

  // ── Address ──────────────────────────────────────────────────
  const address = await prisma.address.findUnique({ where: { id: addressId } });

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }
  if (!address.postalCode) {
    return res
      .status(400)
      .json({ message: "The selected address is missing a pincode" });
  }

  // ── Delivery + COD serviceability ───────────────────────────
  // checkDeliveryAvailability never throws for upstream/Delhivery problems
  // (it resolves to { available: false, ... }), but we still guard here
  // in case of a genuinely unexpected failure so it can never crash the
  // order creation request.
  let deliveryCheck;
  try {
    deliveryCheck = await checkDeliveryAvailability(address.postalCode);
  } catch (err) {
    console.error("Delivery availability check failed:", err.message);
    return res.status(502).json({
      message:
        "Unable to verify delivery availability right now. Please try again.",
    });
  }

  if (!deliveryCheck?.available) {
    return res.status(400).json({
      message:
        deliveryCheck?.message || "Delivery is not available for this pincode",
    });
  }

  if (normalizedPaymentMethod === "cod" && !deliveryCheck.cod) {
    return res.status(400).json({
      message:
        "Cash on Delivery is not available for this pincode. Please choose online payment instead.",
    });
  }

  // ── Items & pricing — backend is the source of truth ───────
  let orderItemsData;
  let subtotal;
  let discountAmount;

  try {
    ({ orderItemsData, subtotal } = await resolveOrderItems(items));
    discountAmount = await resolveDiscount(couponCode, subtotal);
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    throw err;
  }

  const totalAmount = round2(Math.max(subtotal - discountAmount, 0));

  const orderNumber = "ORD-" + Date.now();

  // ── Create order + items + payment atomically ──────────────
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        orderNumber,
        subtotal,
        discountAmount,
        totalAmount,
        paymentMethod: normalizedPaymentMethod,
      },
    });

    await tx.orderItem.createMany({
      data: orderItemsData.map((item) => ({
        ...item,
        orderId: newOrder.id,
      })),
    });

    await tx.payment.create({
      data: {
        orderId: newOrder.id,
        paymentGateway: normalizedPaymentMethod === "cod" ? "cod" : "razorpay",
        paymentStatus: "PENDING",
        amount: totalAmount,
      },
    });

    return newOrder;
  });

  // ── Cash on Delivery: the order is complete, no gateway involved ──
  if (normalizedPaymentMethod === "cod") {
    return res.status(200).json({ order, razorpayOrder: null });
  }

  // ── Razorpay: create the gateway order ──────────────────────
  // The DB order + PENDING payment row already exist at this point. If
  // Razorpay order creation fails, we do NOT roll back the order — it
  // stays PENDING/unpaid and the frontend can prompt the user to retry
  // payment for the same order rather than silently losing it.
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order.id,
    });

    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { transactionId: razorpayOrder.id },
    });

    return res.status(200).json({ order, razorpayOrder });
  } catch (err) {
    console.error("Razorpay order creation failed:", err.message);
    return res.status(502).json({
      message:
        "Your order was saved but online payment could not be started. Please retry payment from your orders page.",
      order,
      razorpayOrder: null,
    });
  }
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
  const payload =
    typeof req.body.body === "string" ? JSON.parse(req.body.body) : req.body;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    payload;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Missing payment verification fields" });
  }

  // ── Verify signature ───────────────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }

  // ── Find payment by Razorpay order ID ─────────────────────
  const payment = await prisma.payment.findFirst({
    where: { transactionId: razorpay_order_id },
    include: { order: true },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  const dbOrderId = payment.orderId;

  // ── Update payment + order in one transaction ──────────────
  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { orderId: dbOrderId },
      data: {
        paymentStatus: "SUCCESS",
        transactionId: razorpay_payment_id,
        amount: payment.order.totalAmount,
        paidAt: new Date(),
      },
    }),

    prisma.order.update({
      where: { id: dbOrderId },
      data: { paymentStatus: "SUCCESS" },
    }),
  ]);

  res.json({ success: true });
});

import asyncHandler from "express-async-handler";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// export const createOrderController = asyncHandler(async (req, res) => {
//   const { userId, addressId, items, totalAmount, paymentMethod } = req.body;

//   // ── Validate items ─────────────────────────────────────────
//   if (!items || !Array.isArray(items) || items.length === 0) {
//     return res
//       .status(400)
//       .json({ message: "Order must have at least one item" });
//   }

//   // ── Fetch variants so we have accurate prices & product IDs ─
//   const variantIds = items.map((item) => item.variantId);

//   const variants = await prisma.productVariant.findMany({
//     where: { id: { in: variantIds } },
//     include: {
//       product: true,
//     },
//   });

//   if (variants.length !== variantIds.length) {
//     return res.status(400).json({ message: "One or more variants not found" });
//   }

//   const variantMap = new Map(variants.map((v) => [v.id, v]));

//   // ── Build order items & calculate subtotal ─────────────────
//   const orderItemsData = items.map((item) => {
//     const variant = variantMap.get(item.variantId);

//     const unitPrice = parseFloat(
//       variant.salePrice ??
//         variant.price ??
//         variant.product.salePrice ??
//         variant.product.basePrice,
//     );

//     const totalPrice = unitPrice * item.quantity;

//     return {
//       productId: variant.productId,
//       variantId: variant.id,
//       productName: variant.product.title,
//       quantity: item.quantity,
//       unitPrice,
//       totalPrice,
//     };
//   });

//   const subtotal = orderItemsData.reduce((sum, i) => sum + i.totalPrice, 0);

//   const orderNumber = "ORD-" + Date.now();

//   // ── Create order + items in one transaction ────────────────
//   const order = await prisma.$transaction(async (tx) => {
//     const newOrder = await tx.order.create({
//       data: {
//         userId,
//         addressId,
//         orderNumber,
//         totalAmount,
//         subtotal,
//         paymentMethod,
//       },
//     });

//     await tx.orderItem.createMany({
//       data: orderItemsData.map((item) => ({
//         ...item,
//         orderId: newOrder.id,
//       })),
//     });

//     await tx.payment.create({
//       data: {
//         orderId: newOrder.id,
//         paymentGateway: "razorpay",
//         paymentStatus: "PENDING",
//         amount: totalAmount,
//       },
//     });

//     return newOrder;
//   });

//   // ── Create Razorpay order ──────────────────────────────────
//   const razorpayOrder = await razorpay.orders.create({
//     amount: Math.round(totalAmount * 100), // paise, must be integer
//     currency: "INR",
//     receipt: order.id,
//   });

//   // ── Store Razorpay transaction ID ──────────────────────────
//   await prisma.payment.updateMany({
//     where: { orderId: order.id },
//     data: { transactionId: razorpayOrder.id },
//   });

//   res.status(200).json({ order, razorpayOrder });
// });

export const createOrderController = asyncHandler(async (req, res) => {
  const { userId, addressId, items, totalAmount, paymentMethod } = req.body;

  // ── Validate ───────────────────────────────────────────────
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must have at least one item" });
  }

  // ── Determine if frontend sends productId or variantId ─────
  const firstItem = items[0];
  const useVariant = !!firstItem.variantId;

  let orderItemsData;

  if (useVariant) {
    // ── Path A: items have variantId ───────────────────────
    const variantIds = items
      .map((item) => item.variantId)
      .filter(Boolean); // filter out any undefined

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      return res.status(400).json({ message: "One or more variants not found" });
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    orderItemsData = items.map((item) => {
      const variant = variantMap.get(item.variantId);
      const unitPrice = parseFloat(
        variant.salePrice ??
        variant.price ??
        variant.product.salePrice ??
        variant.product.basePrice
      );

      return {
        productId:   variant.productId,
        variantId:   variant.id,
        productName: variant.product.title,
        quantity:    item.quantity,
        unitPrice,
        totalPrice:  unitPrice * item.quantity,
      };
    });

  } else {
    // ── Path B: items have product id (no variant selected) ─
    const productIds = items
      .map((item) => item.id)
      .filter(Boolean);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "One or more products not found" });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    orderItemsData = items.map((item) => {
      const product = productMap.get(item.id);
      const unitPrice = parseFloat(
        product.salePrice ?? product.basePrice
      );

      return {
        productId:   product.id,
        variantId:   null,       // no variant
        productName: product.title,
        quantity:    item.quantity,
        unitPrice,
        totalPrice:  unitPrice * item.quantity,
      };
    });
  }

  const subtotal = orderItemsData.reduce((sum, i) => sum + i.totalPrice, 0);
  const orderNumber = "ORD-" + Date.now();

  // ── Transaction: order + items + payment ───────────────────
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        orderNumber,
        totalAmount,
        subtotal,
        paymentMethod,
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
        orderId:        newOrder.id,
        paymentGateway: "razorpay",
        paymentStatus:  "PENDING",
        amount:         totalAmount,
      },
    });

    return newOrder;
  });

  // ── Create Razorpay order ──────────────────────────────────
  const razorpayOrder = await razorpay.orders.create({
    amount:   Math.round(totalAmount * 100),
    currency: "INR",
    receipt:  order.id,
  });

  // ── Store Razorpay transaction ID ──────────────────────────
  await prisma.payment.updateMany({
    where: { orderId: order.id },
    data:  { transactionId: razorpayOrder.id },
  });

  res.status(200).json({ order, razorpayOrder });
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
  const payload =
    typeof req.body.body === "string" ? JSON.parse(req.body.body) : req.body;

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = payload;

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

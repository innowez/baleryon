import asyncHandler from "express-async-handler";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createOrderController = asyncHandler(async (req, res) => {
  console.log(req.body, "====================");

  const { userId, addressId, items, totalAmount, paymentMethod } = req.body;

  const orderNumber = "ORD-" + Date.now();

  const order = await prisma.order.create({
    data: {
      userId,
      addressId,
      orderNumber,
      totalAmount,
      paymentMethod,
    },
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: totalAmount * 100,
    currency: "INR",
    receipt: order.id,
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      transactionId: razorpayOrder.id,
      paymentGateway: "razorpay",
      paymentStatus: "PENDING",
    },
  });

  // await prisma.payment.create({
  //   data: {
  //     orderId: order.id,
  //     paymentGateway: "RAZORPAY",
  //     amount: totalAmount,
  //   },
  // });

  res.status(200).json({
    order,
    razorpayOrder,
  });
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
  // const {
  //   razorpay_order_id,
  //   razorpay_payment_id,
  //   razorpay_signature,
  //   orderId,
  // } = req.body;

  const payload =
    typeof req.body.body === "string" ? JSON.parse(req.body.body) : req.body;

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = payload;

  console.log(orderId, "++++++++++++++=========++++++++++++++=============");

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  console.log(
    expectedSignature,
    "expectedSignatureexpectedSignatureexpectedSignature",
  );
  console.log(
    razorpay_signature,
    "razorpay_signaturerazorpay_signaturerazorpay_signature",
  );

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: razorpay_order_id,
    },
    include: { order: true },
  });

  console.log(payment, "paymentpaymentpaymentpaymentpaymentpaymentpayment");

  // const orderId = payment?.orderId;

  if (!orderId) {
    return res.status(400).json({ message: "Order not found" });
  }

  await prisma.payment.updateMany({
    where: { orderId: orderId?.order?.id },
    data: {
      paymentStatus: "SUCCESS",
      transactionId: razorpay_payment_id,
      paymentGateway: "razorpay",
    },
  });

  await prisma.order.update({
    where: { id: orderId?.order?.id },
    data: { paymentStatus: "SUCCESS" },
  });

  res.json({ success: true });
});

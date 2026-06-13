// controllers/orderTrackerController.js

import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

export const getOrderTrackingController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: {
                  isPrimary: true,
                },
                take: 1,
              },
            },
          },
        },
      },
      payments: true,
      shipments: true,
      address: true,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const trackingSteps = [
    {
      status: "PENDING",
      label: "Order Placed",
      completed: true,
    },
    {
      status: "CONFIRMED",
      label: "Order Confirmed",
      completed: false,
    },
    {
      status: "PROCESSING",
      label: "Processing",
      completed: false,
    },
    {
      status: "SHIPPED",
      label: "Shipped",
      completed: false,
    },
    {
      status: "OUT_FOR_DELIVERY",
      label: "Out For Delivery",
      completed: false,
    },
    {
      status: "DELIVERED",
      label: "Delivered",
      completed: false,
    },
  ];

  const currentIndex = trackingSteps.findIndex(
    (step) => step.status === order.orderStatus,
  );

  trackingSteps.forEach((step, index) => {
    step.completed = index <= currentIndex;
    step.current = index === currentIndex;
  });

  return res.status(200).json({
    success: true,
    order,
    trackingSteps,
  });
});

export const getUserOrdersController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: {
                  isPrimary: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: {
      placedAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    orders,
  });
});

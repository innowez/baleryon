// controller/profileController.js

import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

export const getProfileController = asyncHandler(
  async (req, res) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        addresses: {
          where: {
            isDefault: true,
          },
          take: 1,
        },

        orders: {
          select: {
            id: true,
            totalAmount: true,
            orderStatus: true,
            placedAt: true,
          },
          orderBy: {
            placedAt: "desc",
          },
          take: 5,
        },

        wishlists: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const stats = {
      totalOrders: user.orders.length,
      wishlistItems: user.wishlists.length,
      totalSpent: user.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
      ),
    };

    res.status(200).json({
      success: true,
      user,
      stats,
    });
  }
);

export const updateProfileController = asyncHandler(
  async (req, res) => {
    const { userId } = req.params;

    const {
      fullName,
      phone,
      profileImage,
    } = req.body;

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName,
        phone,
        profileImage,
      },
    });

    res.status(200).json({
      success: true,
      user,
    });
  }
);
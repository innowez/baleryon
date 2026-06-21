// controller/reviewController.js

import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

export const createOrUpdateReviewController = asyncHandler(async (req, res) => {
  const { userId, productId, rating, review } = req.body;

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: productId.trim(),
      order: {
        userId: userId.trim(),
        paymentStatus: "SUCCESS",
      },
    },
  });

  if (!purchased) {
    return res.status(403).json({
      success: false,
      message: "Only customers who purchased this product can review it",
    });
  }

  const existing = await prisma.review.findFirst({
    where: {
      userId,
      productId,
    },
  });

  let result;

  if (existing) {
    result = await prisma.review.update({
      where: {
        id: existing.id,
      },
      data: {
        rating,
        review,
      },
    });
  } else {
    result = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        review,
      },
    });
  }

  res.json({
    success: true,
    review: result,
  });
});

export const getProductReviewsController = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return res.json({
    success: true,
    rating: averageRating,
    reviewCount,
    distribution,
    reviews,
  });
});

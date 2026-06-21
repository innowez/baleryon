import asyncHandler from "express-async-handler";
import prisma from "../../lib/prisma.js";

// @desc Get all categories
// @route GET /api/category/getCategories
export const getCategoriesController = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null, // only root categories
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  res.status(200).json({
    categories,
  });
});
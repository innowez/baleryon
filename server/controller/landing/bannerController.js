// controller/landing/bannerController.ts

import asyncHandler from "express-async-handler";
import prisma from "../../lib/prisma.js";

export const getActiveBannerController = asyncHandler(async (req, res) => {
  const banner = await prisma.banner.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!banner) {
    return res.status(404).json({
      message: "No active banner found",
    });
  }

  res.status(200).json({
    banner,
  });
});
import asyncHandler from "express-async-handler";
import prisma from "../../lib/prisma.js";

// GET ACTIVE LIMITED SEASON
export const getActiveLimitedSeasonController = asyncHandler(
  async (req, res) => {
    const season = await prisma.limitedSeason.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!season) {
      return res.status(404).json({
        message: "No active promotional banner found",
      });
    }

    res.status(200).json({
      season,
    });
  }
);
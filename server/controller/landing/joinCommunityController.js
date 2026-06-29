// controller/landing/joinCommunityController.ts

import asyncHandler from "express-async-handler";
import prisma from "../../lib/prisma.js";

export const joinCommunityController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const existing = await prisma.joinCommunity.findUnique({
    where: {
      email,
    },
  });

  if (existing) {
    return res.status(409).json({
      message: "Email already subscribed",
    });
  }

  const subscriber = await prisma.joinCommunity.create({
    data: {
      email,
    },
  });

  res.status(201).json({
    message: "Successfully joined community",
    subscriber,
  });
});
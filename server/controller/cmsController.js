import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";
import { parseIntField, uploadCmsImage } from "../utils/cmsHelpers.js";
import { resolveSingleImageUpdate } from "../utils/mediaHelpers.js";
import {
  CLOUDINARY_FOLDERS,
  deleteFileFromCloudinary,
} from "../utils/cloudinaryUtils.js";

const JOIN_STATUSES = ["ADDED", "PENDING", "INVALID", "VALID"];

// ─── Banners ─────────────────────────────────────────────────────────────────

export const getBannersController = asyncHandler(async (_req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ banners });
});

export const getBannerByIdController = asyncHandler(async (req, res) => {
  const banner = await prisma.banner.findUnique({ where: { id: req.params.id } });
  if (!banner) return res.status(404).json({ message: "Banner not found" });
  res.status(200).json({ banner });
});

export const createBannerController = asyncHandler(async (req, res) => {
  const { topContent, mainContent, lastContent, shopNowLink } = req.body;

  let imageUrl = null;
  try {
    imageUrl = await uploadCmsImage(req, CLOUDINARY_FOLDERS.BANNERS);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const banner = await prisma.banner.create({
    data: {
      imageUrl,
      topContent: topContent?.trim() || null,
      mainContent: mainContent?.trim() || null,
      lastContent: lastContent?.trim() || null,
      shopNowLink: shopNowLink?.trim() || null,
    },
  });

  res.status(201).json({ message: "Banner created", banner });
});

export const updateBannerController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { topContent, mainContent, lastContent, shopNowLink } = req.body;

  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Banner not found" });

  let imageUrl;
  try {
    imageUrl = await resolveSingleImageUpdate({
      existingUrl: existing.imageUrl,
      newFile: req.file,
      section: CLOUDINARY_FOLDERS.BANNERS,
      removeImage: req.body.removeImage,
      uploadFn: req.file
        ? () => uploadCmsImage(req, CLOUDINARY_FOLDERS.BANNERS)
        : null,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const data = {
    topContent: topContent?.trim() ?? existing.topContent,
    mainContent: mainContent?.trim() ?? existing.mainContent,
    lastContent: lastContent?.trim() ?? existing.lastContent,
    shopNowLink: shopNowLink?.trim() ?? existing.shopNowLink,
  };
  if (imageUrl !== undefined) data.imageUrl = imageUrl;

  const banner = await prisma.banner.update({ where: { id }, data });
  res.status(200).json({ message: "Banner updated", banner });
});

export const toggleBannerActiveController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Banner not found" });

  const banner = await prisma.banner.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
  res.status(200).json({ message: "Banner status updated", banner });
});

export const deleteBannerController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Banner not found" });
  }
  if (existing.imageUrl) {
    await deleteFileFromCloudinary(existing.imageUrl);
  }
  try {
    await prisma.banner.delete({ where: { id } });
    res.status(200).json({ message: "Banner deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Banner not found" });
    }
    throw err;
  }
});

// ─── Limited Season ────────────────────────────────────────────────────────────

export const getLimitedSeasonsController = asyncHandler(async (_req, res) => {
  const limitedSeasons = await prisma.limitedSeason.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ limitedSeasons });
});

export const getLimitedSeasonByIdController = asyncHandler(async (req, res) => {
  const item = await prisma.limitedSeason.findUnique({
    where: { id: req.params.id },
  });
  if (!item) return res.status(404).json({ message: "Limited season not found" });
  res.status(200).json({ limitedSeason: item });
});

export const createLimitedSeasonController = asyncHandler(async (req, res) => {
  const { mainContent, description, timeCountingHours, ctaLink } = req.body;

  let backgroundImageUrl = null;
  try {
    backgroundImageUrl = await uploadCmsImage(
      req,
      CLOUDINARY_FOLDERS.LIMITED_SEASONS
    );
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const limitedSeason = await prisma.limitedSeason.create({
    data: {
      mainContent: mainContent?.trim() || null,
      description: description?.trim() || null,
      timeCountingHours: parseIntField(timeCountingHours, 3),
      ctaLink: ctaLink?.trim() || null,
      backgroundImageUrl,
    },
  });

  res.status(201).json({ message: "Limited season created", limitedSeason });
});

export const updateLimitedSeasonController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { mainContent, description, timeCountingHours, ctaLink } = req.body;

  const existing = await prisma.limitedSeason.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Limited season not found" });
  }

  let backgroundImageUrl;
  try {
    backgroundImageUrl = await resolveSingleImageUpdate({
      existingUrl: existing.backgroundImageUrl,
      newFile: req.file,
      section: CLOUDINARY_FOLDERS.LIMITED_SEASONS,
      removeImage: req.body.removeImage,
      uploadFn: req.file
        ? () => uploadCmsImage(req, CLOUDINARY_FOLDERS.LIMITED_SEASONS)
        : null,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const data = {
    mainContent: mainContent?.trim() ?? existing.mainContent,
    description: description?.trim() ?? existing.description,
    timeCountingHours:
      timeCountingHours !== undefined
        ? parseIntField(timeCountingHours, existing.timeCountingHours)
        : existing.timeCountingHours,
    ctaLink: ctaLink?.trim() ?? existing.ctaLink,
  };
  if (backgroundImageUrl !== undefined) {
    data.backgroundImageUrl = backgroundImageUrl;
  }

  const limitedSeason = await prisma.limitedSeason.update({ where: { id }, data });
  res.status(200).json({ message: "Limited season updated", limitedSeason });
});

export const toggleLimitedSeasonActiveController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.limitedSeason.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Limited season not found" });
    }

    const limitedSeason = await prisma.limitedSeason.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    res.status(200).json({ message: "Limited season status updated", limitedSeason });
  }
);

export const deleteLimitedSeasonController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.limitedSeason.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Limited season not found" });
  }
  if (existing.backgroundImageUrl) {
    await deleteFileFromCloudinary(existing.backgroundImageUrl);
  }
  try {
    await prisma.limitedSeason.delete({ where: { id } });
    res.status(200).json({ message: "Limited season deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Limited season not found" });
    }
    throw err;
  }
});

// ─── Urban Stories ─────────────────────────────────────────────────────────────

export const getUrbanStoriesController = asyncHandler(async (_req, res) => {
  const urbanStories = await prisma.urbanStory.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ urbanStories });
});

export const getUrbanStoryByIdController = asyncHandler(async (req, res) => {
  const urbanStory = await prisma.urbanStory.findUnique({
    where: { id: req.params.id },
  });
  if (!urbanStory) return res.status(404).json({ message: "Urban story not found" });
  res.status(200).json({ urbanStory });
});

export const createUrbanStoryController = asyncHandler(async (req, res) => {
  const { category, ctaLink } = req.body;

  if (!category?.trim()) {
    return res.status(400).json({ message: "Category is required" });
  }

  let imageUrl = null;
  try {
    imageUrl = await uploadCmsImage(req, CLOUDINARY_FOLDERS.URBAN_STORIES);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const urbanStory = await prisma.urbanStory.create({
    data: {
      category: category.trim(),
      ctaLink: ctaLink?.trim() || null,
      imageUrl,
    },
  });

  res.status(201).json({ message: "Urban story created", urbanStory });
});

export const updateUrbanStoryController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category, ctaLink } = req.body;

  const existing = await prisma.urbanStory.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Urban story not found" });

  let imageUrl;
  try {
    imageUrl = await resolveSingleImageUpdate({
      existingUrl: existing.imageUrl,
      newFile: req.file,
      section: CLOUDINARY_FOLDERS.URBAN_STORIES,
      removeImage: req.body.removeImage,
      uploadFn: req.file
        ? () => uploadCmsImage(req, CLOUDINARY_FOLDERS.URBAN_STORIES)
        : null,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const data = {
    category: category?.trim() ?? existing.category,
    ctaLink: ctaLink?.trim() ?? existing.ctaLink,
  };
  if (imageUrl !== undefined) data.imageUrl = imageUrl;

  const urbanStory = await prisma.urbanStory.update({ where: { id }, data });
  res.status(200).json({ message: "Urban story updated", urbanStory });
});

export const toggleUrbanStoryActiveController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.urbanStory.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Urban story not found" });

  const urbanStory = await prisma.urbanStory.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
  res.status(200).json({ message: "Urban story status updated", urbanStory });
});

export const deleteUrbanStoryController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.urbanStory.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Urban story not found" });
  }
  if (existing.imageUrl) {
    await deleteFileFromCloudinary(existing.imageUrl);
  }
  try {
    await prisma.urbanStory.delete({ where: { id } });
    res.status(200).json({ message: "Urban story deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Urban story not found" });
    }
    throw err;
  }
});

// ─── Join Community ────────────────────────────────────────────────────────────

export const getJoinCommunityController = asyncHandler(async (_req, res) => {
  const entries = await prisma.joinCommunity.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ entries });
});

export const createJoinCommunityController = asyncHandler(async (req, res) => {
  const { email, status } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }

  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  const entryStatus =
    status && JOIN_STATUSES.includes(status) ? status : "ADDED";

  try {
    const entry = await prisma.joinCommunity.create({
      data: { email: normalized, status: entryStatus },
    });
    res.status(201).json({ message: "Email added", entry });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }
    throw err;
  }
});

export const updateJoinCommunityStatusController = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !JOIN_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${JOIN_STATUSES.join(", ")}`,
      });
    }

    try {
      const entry = await prisma.joinCommunity.update({
        where: { id },
        data: { status },
      });
      res.status(200).json({ message: "Status updated", entry });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Entry not found" });
      }
      throw err;
    }
  }
);

export const deleteJoinCommunityController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.joinCommunity.delete({ where: { id } });
    res.status(200).json({ message: "Entry deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Entry not found" });
    }
    throw err;
  }
});

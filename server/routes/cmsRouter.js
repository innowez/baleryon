import express from "express";
import {
  createBannerController,
  createJoinCommunityController,
  createLimitedSeasonController,
  createUrbanStoryController,
  deleteBannerController,
  deleteJoinCommunityController,
  deleteLimitedSeasonController,
  deleteUrbanStoryController,
  getBannerByIdController,
  getBannersController,
  getJoinCommunityController,
  getLimitedSeasonByIdController,
  getLimitedSeasonsController,
  getUrbanStoriesController,
  getUrbanStoryByIdController,
  toggleBannerActiveController,
  toggleLimitedSeasonActiveController,
  toggleUrbanStoryActiveController,
  updateBannerController,
  updateJoinCommunityStatusController,
  updateLimitedSeasonController,
  updateUrbanStoryController,
} from "../controller/cmsController.js";
import {
  uploadSingleBackground,
  uploadSingleImage,
} from "../utils/uploadMiddleware.js";

const router = express.Router();

// Banners
router.get("/banners", getBannersController);
router.get("/banners/:id", getBannerByIdController);
router.post("/banners", uploadSingleImage, createBannerController);
router.put("/banners/:id", uploadSingleImage, updateBannerController);
router.patch("/banners/:id/toggle-active", toggleBannerActiveController);
router.delete("/banners/:id", deleteBannerController);

// Limited Season
router.get("/limited-seasons", getLimitedSeasonsController);
router.get("/limited-seasons/:id", getLimitedSeasonByIdController);
router.post(
  "/limited-seasons",
  uploadSingleBackground,
  createLimitedSeasonController
);
router.put(
  "/limited-seasons/:id",
  uploadSingleBackground,
  updateLimitedSeasonController
);
router.patch(
  "/limited-seasons/:id/toggle-active",
  toggleLimitedSeasonActiveController
);
router.delete("/limited-seasons/:id", deleteLimitedSeasonController);

// Urban Stories
router.get("/urban-stories", getUrbanStoriesController);
router.get("/urban-stories/:id", getUrbanStoryByIdController);
router.post("/urban-stories", uploadSingleImage, createUrbanStoryController);
router.put("/urban-stories/:id", uploadSingleImage, updateUrbanStoryController);
router.patch("/urban-stories/:id/toggle-active", toggleUrbanStoryActiveController);
router.delete("/urban-stories/:id", deleteUrbanStoryController);

// Join Community
router.get("/join-community", getJoinCommunityController);
router.post("/join-community", createJoinCommunityController);
router.patch("/join-community/:id/status", updateJoinCommunityStatusController);
router.delete("/join-community/:id", deleteJoinCommunityController);

export default router;


import express from "express";

import { protect } from "../middlewares/authMiddleware.js";

import {
  getWishlistController,
  addWishlistController,
  removeWishlistController,
  clearWishlistController,
} from "../controller/wishlistController.js";

const router = express.Router();

// All routes require a logged-in user.
router.get("/", protect, getWishlistController);

router.post("/", protect, addWishlistController);

router.delete(
  "/:productId",
  protect,
  removeWishlistController
);

router.delete("/", protect, clearWishlistController);

export default router;
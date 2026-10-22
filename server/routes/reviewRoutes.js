// routes/reviewRoutes.js

import express from "express";
import {
  getProductReviewsController,
  createOrUpdateReviewController,
  getUserReviewController,
} from "../controller/reviewController.js";

const router = express.Router();

router.get("/product/:productId", getProductReviewsController);

router.get("/user/:userId/product/:productId", getUserReviewController);

router.post("/", createOrUpdateReviewController);

export default router;
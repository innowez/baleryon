// routes/reviewRoutes.js

import express from "express";
import {
  getProductReviewsController,
  createOrUpdateReviewController,
} from "../controller/reviewController.js";

const router = express.Router();

router.get("/product/:productId", getProductReviewsController);

router.post("/", createOrUpdateReviewController);

export default router;
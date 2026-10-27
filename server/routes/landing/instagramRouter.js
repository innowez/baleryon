
import express from "express";
import {
  getInstagramPostsController,
} from "../../controller/landing/instagramController.js";

const router = express.Router();

router.get("/posts", getInstagramPostsController);

export default router;

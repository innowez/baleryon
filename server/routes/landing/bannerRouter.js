import express from "express";
import { getActiveBannerController } from "../../controller/landing/bannerController.js";

const router = express.Router();

router.get("/active", getActiveBannerController);

export default router;
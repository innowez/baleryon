import express from "express";
import { getActiveLimitedSeasonController } from "../../controller/landing/limitedSeasonController.js";

const router = express.Router();

router.get("/active", getActiveLimitedSeasonController);

export default router;
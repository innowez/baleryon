// routes/profileRoutes.js

import express from "express";
import {
  getProfileController,
  updateProfileController,
} from "../controller/profileController.js";

const router = express.Router();

router.get("/:userId", getProfileController);
router.patch("/:userId", updateProfileController);

export default router;
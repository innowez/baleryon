// routes/community/communityRoutes.ts

import express from "express";
import { joinCommunityController } from "../../controller/landing/joinCommunityController.js";

const router = express.Router();

router.post("/join", joinCommunityController);

export default router;
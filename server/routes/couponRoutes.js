// routes/coupon.routes.ts

import { Router } from "express";
import { validateCoupon } from "../controller/couponController.js";

const router = Router();

router.post("/validate", validateCoupon);

export default router;
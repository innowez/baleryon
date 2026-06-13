import express from "express";

import {
  getOrderTrackingController,
  getUserOrdersController,
  // updateOrderStatusController,
} from "../controller/orderTrackerController.js";

const router = express.Router();

// User
router.get("/user/:userId/orders", getUserOrdersController);

router.get("/tracking/:orderId", getOrderTrackingController);

// Admin
// router.patch(
//   "/admin/update-status/:orderId",
//   updateOrderStatusController
// );

export default router;
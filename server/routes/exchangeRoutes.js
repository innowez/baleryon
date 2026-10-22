// routes/exchangeRoutes.js

import express from "express";
import {
  getExchangeOptionsController,
  createExchangeRequestController,
  getOrderExchangeRequestsController,
} from "../controller/exchangeController.js";

const router = express.Router();

router.get("/options/:orderItemId", getExchangeOptionsController);

router.post("/", createExchangeRequestController);

router.get("/order/:orderId", getOrderExchangeRequestsController);

export default router;

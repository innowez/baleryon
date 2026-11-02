import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  checkCartStockController,
  getCartController,
  addCartItemController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "../controller/cartStockController.js";

const router = express.Router();
router.post("/check-stock", checkCartStockController); // public
router.get("/", protect, getCartController);
router.post("/items", protect, addCartItemController);
router.put("/items/:id", protect, updateCartItemController);
router.delete("/items/:id", protect, removeCartItemController);
router.delete("/", protect, clearCartController);
export default router;

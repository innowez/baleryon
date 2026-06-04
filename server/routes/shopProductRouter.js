import express from "express";
import {
  getShopFilterOptionsController,
  getShopProductByIdController,
  listShopProductsController,
} from "../controller/shopProductController.js";

const router = express.Router();

router.get("/filters", getShopFilterOptionsController);
router.get("/", listShopProductsController);
router.get("/:id", getShopProductByIdController);

export default router;

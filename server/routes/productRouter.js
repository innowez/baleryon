import express from "express";
import {
  addProductController,
  deleteProductController,
  getProductByIdController,
  getProductsController,
  updateProductController,
} from "../controller/productController.js";
import { uploadProductImages } from "../utils/uploadMiddleware.js";

var router = express.Router();

router.route("/addProduct").post(uploadProductImages, addProductController);

// GET PRODUCTS
router.route("/getProducts").get(getProductsController);

router.route("/productDetails").get(getProductByIdController);

router
  .route("/updateProduct/:id")
  .put(uploadProductImages, updateProductController);

router.route("/deleteProduct/:id").delete(deleteProductController);

export default router;
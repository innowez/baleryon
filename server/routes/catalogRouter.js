import express from "express";
import {
  createBrandController,
  createCategoryController,
  deleteBrandController,
  deleteCategoryController,
  getBrandByIdController,
  getBrandsController,
  getCategoriesController,
  getCategoryByIdController,
  updateBrandController,
  updateCategoryController,
} from "../controller/catalogController.js";
import { uploadSingleImage, uploadSingleLogo } from "../utils/uploadMiddleware.js";

const router = express.Router();

router.get("/categories", getCategoriesController);
router.get("/categories/:id", getCategoryByIdController);
router.post("/categories", uploadSingleImage, createCategoryController);
router.put("/categories/:id", uploadSingleImage, updateCategoryController);
router.delete("/categories/:id", deleteCategoryController);

router.get("/brands", getBrandsController);
router.get("/brands/:id", getBrandByIdController);
router.post("/brands", uploadSingleLogo, createBrandController);
router.put("/brands/:id", uploadSingleLogo, updateBrandController);
router.delete("/brands/:id", deleteBrandController);

export default router;

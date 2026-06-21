import express from "express";
import { getCategoriesController } from "../../controller/landing/categoryController.js";

const router = express.Router();

router.get("/getCategories", getCategoriesController);

export default router;
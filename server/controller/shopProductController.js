import asyncHandler from "express-async-handler";
import {
  getShopFilterOptions,
  getShopProductById,
  listShopProducts,
} from "../services/shopProductService.js";

// @desc    List products for storefront (filters, sort, pagination)
// @route   GET /api/shop/products
// @access  Public
export const listShopProductsController = asyncHandler(async (req, res) => {
  const result = await listShopProducts(req.query);
  res.status(200).json(result);
});

// @desc    Filter metadata for storefront (categories, colors, sizes, price range)
// @route   GET /api/shop/products/filters
// @access  Public
export const getShopFilterOptionsController = asyncHandler(async (req, res) => {
  const filters = await getShopFilterOptions(req.query);
  res.status(200).json(filters);
});

// @desc    Product details for storefront
// @route   GET /api/shop/products/:id
// @access  Public
export const getShopProductByIdController = asyncHandler(async (req, res) => {
  const product = await getShopProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({ product });
});

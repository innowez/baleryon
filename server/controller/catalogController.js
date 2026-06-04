import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";
import { uniqueSlug } from "../utils/slugify.js";
import {
  createCategoryRecord,
  uploadCategoryImage,
} from "../utils/categoryHelpers.js";
import { createBrandRecord, uploadBrandLogo } from "../utils/brandHelpers.js";
import { resolveSingleImageUpdate } from "../utils/mediaHelpers.js";
import {
  CLOUDINARY_FOLDERS,
  deleteFileFromCloudinary,
} from "../utils/cloudinaryUtils.js";

// ─── Categories ─────────────────────────────────────────────────────────────

export const getCategoriesController = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  res.status(200).json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      parentId: c.parentId,
      productCount: c._count.products,
      createdAt: c.createdAt,
    })),
  });
});

export const getCategoryByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json({ category });
});

export const createCategoryController = asyncHandler(async (req, res) => {
  const { name, parentId } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  let imageUrl = null;
  try {
    imageUrl = await uploadCategoryImage(req);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const category = await createCategoryRecord({
      name: name.trim(),
      image: imageUrl,
      parentId: parentId || null,
    });
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Category name already exists" });
    }
    throw err;
  }
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Category not found" });
  }

  const slug =
    existing.name === name.trim()
      ? existing.slug
      : await uniqueSlug(prisma, name.trim(), "category");

  let imageUrl;
  try {
    imageUrl = await resolveSingleImageUpdate({
      existingUrl: existing.image,
      newFile: req.file,
      section: CLOUDINARY_FOLDERS.CATEGORIES,
      removeImage: req.body.removeImage,
      uploadFn: req.file ? () => uploadCategoryImage(req) : null,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const updateData = { name: name.trim(), slug };
  if (imageUrl !== undefined) {
    updateData.image = imageUrl;
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });
    res.status(200).json({ message: "Category updated", category });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Category name already exists" });
    }
    throw err;
  }
});

export const deleteCategoryController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return res.status(400).json({
      message: `Cannot delete category: ${productCount} product(s) are linked to it`,
    });
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  if (category.image) {
    await deleteFileFromCloudinary(category.image);
  }

  try {
    await prisma.category.delete({ where: { id } });
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Category not found" });
    }
    throw err;
  }
});

// ─── Brands ───────────────────────────────────────────────────────────────────

export const getBrandsController = asyncHandler(async (req, res) => {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  res.status(200).json({
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      productCount: b._count.products,
      createdAt: b.createdAt,
    })),
  });
});

export const getBrandByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const brand = await prisma.brand.findUnique({ where: { id } });

  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  res.status(200).json({ brand });
});

export const createBrandController = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Brand name is required" });
  }

  let logoUrl = null;
  try {
    logoUrl = await uploadBrandLogo(req);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const brand = await createBrandRecord({
      name: name.trim(),
      logo: logoUrl,
    });
    res.status(201).json({ message: "Brand created", brand });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Brand name already exists" });
    }
    throw err;
  }
});

export const updateBrandController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Brand name is required" });
  }

  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Brand not found" });
  }

  const slug =
    existing.name === name.trim()
      ? existing.slug
      : await uniqueSlug(prisma, name.trim(), "brand");

  let logoUrl;
  try {
    logoUrl = await resolveSingleImageUpdate({
      existingUrl: existing.logo,
      newFile: req.file,
      section: CLOUDINARY_FOLDERS.BRANDS,
      removeImage: req.body.removeImage,
      uploadFn: req.file ? () => uploadBrandLogo(req) : null,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const updateData = { name: name.trim(), slug };
  if (logoUrl !== undefined) {
    updateData.logo = logoUrl;
  }

  try {
    const brand = await prisma.brand.update({
      where: { id },
      data: updateData,
    });
    res.status(200).json({ message: "Brand updated", brand });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Brand name already exists" });
    }
    throw err;
  }
});

export const deleteBrandController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const productCount = await prisma.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    return res.status(400).json({
      message: `Cannot delete brand: ${productCount} product(s) are linked to it`,
    });
  }

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  if (brand.logo) {
    await deleteFileFromCloudinary(brand.logo);
  }

  try {
    await prisma.brand.delete({ where: { id } });
    res.status(200).json({ message: "Brand deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Brand not found" });
    }
    throw err;
  }
});

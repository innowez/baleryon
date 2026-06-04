import asyncHandler from "express-async-handler";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import {
  CLOUDINARY_FOLDERS,
  deleteManyFromCloudinary,
  uploadFileToCloudinary,
} from "../utils/cloudinaryUtils.js";
import { slugify, uniqueSlug } from "../utils/slugify.js";
import { createCategoryRecord } from "../utils/categoryHelpers.js";
import { createBrandRecord } from "../utils/brandHelpers.js";
import { toLegacyProduct } from "../utils/productMapper.js";

const productInclude = {
  category: true,
  brand: true,
  variants: true,
  images: { orderBy: { sortOrder: "asc" } },
};

async function resolveBrand(parsedBrand) {
  if (!parsedBrand) return null;

  if (typeof parsedBrand === "object" && parsedBrand?.id) {
    const byId = await prisma.brand.findUnique({
      where: { id: parsedBrand.id },
    });
    if (byId) return byId;
  }

  const name =
    typeof parsedBrand === "string" ? parsedBrand : parsedBrand?.name;

  if (!name) return null;

  const existing = await prisma.brand.findUnique({
    where: { name: String(name) },
  });

  if (existing) return existing;

  return createBrandRecord({ name: String(name) });
}

async function resolveCategory(parsedCategory) {
  if (typeof parsedCategory === "object" && parsedCategory?.id) {
    const byId = await prisma.category.findUnique({
      where: { id: parsedCategory.id },
    });
    if (byId) return byId;
  }

  const name =
    typeof parsedCategory === "string"
      ? parsedCategory
      : parsedCategory?.name;

  if (!name) return null;

  const existing = await prisma.category.findUnique({
    where: { name: String(name) },
  });

  if (existing) return existing;

  return createCategoryRecord({ name: String(name) });
}

// @desc    Add Product admin
// @route   POST /api/admin/product/addProduct
export const addProductController = asyncHandler(async (req, res) => {
  const { productName, description, price, category, color, sizes } = req.body;

  if (!productName || !description || !price) {
    return res.status(400).json({
      message: "Please provide product name, description, and price",
    });
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({
      message: "Price must be a valid number greater than 0",
    });
  }

  if (!category) {
    return res.status(400).json({ message: "Please provide a category" });
  }

  let parsedCategory = category;
  if (typeof category === "string") {
    try {
      parsedCategory = JSON.parse(category);
    } catch {
      parsedCategory = { name: category };
    }
  }

  let imageUrls = [];
  if (req.files?.length) {
    try {
      for (const file of req.files) {
        const imageUrl = await uploadFileToCloudinary(
          file,
          CLOUDINARY_FOLDERS.PRODUCTS
        );
        imageUrls.push(imageUrl);
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    return res.status(400).json({ message: "Please provide an image" });
  }

  const parsedSizes = parseSizesFromBody(sizes);
  if (!parsedSizes || parsedSizes.length === 0) {
    return res.status(400).json({
      message: "Invalid sizes format. Each size must include size and quantity.",
    });
  }

  const discount = Number(req.body.discount) || 0;
  const salePrice =
    discount > 0 ? numericPrice * (1 - discount / 100) : null;

  const categoryRecord = await resolveCategory(parsedCategory);

  let parsedBrand = req.body.brand;
  if (typeof parsedBrand === "string" && parsedBrand) {
    try {
      parsedBrand = JSON.parse(parsedBrand);
    } catch {
      parsedBrand = { name: parsedBrand };
    }
  }
  const brandRecord = await resolveBrand(parsedBrand);

  const slug = await uniqueSlug(prisma, productName);

  let parsedColors = [];
  const colorsRaw = req.body.colors ?? color;
  if (colorsRaw) {
    try {
      const parsed =
        typeof colorsRaw === "string" ? JSON.parse(colorsRaw) : colorsRaw;
      if (Array.isArray(parsed)) {
        parsedColors = parsed
          .map((item) =>
            typeof item === "string"
              ? { name: item, hex: null }
              : { name: item?.name, hex: item?.hex ?? null }
          )
          .filter((item) => item.name);
      } else if (typeof parsed === "string") {
        parsedColors = [{ name: parsed, hex: null }];
      }
    } catch {
      if (typeof colorsRaw === "string" && colorsRaw.trim()) {
        parsedColors = [{ name: colorsRaw.trim(), hex: null }];
      }
    }
  }
  if (parsedColors.length === 0) {
    parsedColors = [{ name: "default", hex: null }];
  }

  const variantCreates = [];
  let variantIndex = 0;
  for (const colorItem of parsedColors) {
    const colorSlug = slugify(String(colorItem.name)).slice(0, 20) || "default";
    for (const row of parsedSizes) {
      variantCreates.push({
        sku: `${slug}-${colorSlug}-${row.size}-${variantIndex++}`.slice(0, 100),
        color: String(colorItem.name).slice(0, 50),
        colorHex: colorItem.hex ? String(colorItem.hex).slice(0, 7) : null,
        size: String(row.size),
        stock: Number(row.quantity) || 0,
        price: new Prisma.Decimal(numericPrice),
        salePrice:
          salePrice != null ? new Prisma.Decimal(salePrice) : null,
      });
    }
  }

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        title: productName,
        slug,
        description,
        shortDescription: req.body.note || "",
        note: req.body.note || "",
        basePrice: new Prisma.Decimal(numericPrice),
        salePrice: salePrice != null ? new Prisma.Decimal(salePrice) : null,
        discountPercent: discount > 0 ? new Prisma.Decimal(discount) : null,
        isReturnable: req.body.isReturn === true || req.body.isReturn === "true",
        categoryId: categoryRecord?.id,
        brandId: brandRecord?.id ?? null,
        variants: {
          create: variantCreates,
        },
        images: {
          create: imageUrls.map((url, index) => ({
            imageUrl: url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
      include: productInclude,
    });

    return created;
  });

  res.status(201).json({
    message: "Product added successfully",
    product: toLegacyProduct(product),
  });
});

// @desc    Get paginated list of products
// @route   GET /api/admin/product/getProducts
export const getProductsController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: productInclude,
    }),
    prisma.product.count(),
  ]);

  res.status(200).json({
    products: products.map(toLegacyProduct),
    pageNo: page,
    totalPages: Math.ceil(totalProducts / limit) || 1,
    totalProducts,
  });
});

// @desc    Get product details by ID
// @route   GET /api/admin/product/productDetails
export const getProductByIdController = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Product id is required" });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({ product: toLegacyProduct(product) });
});

function parseDeletedImageIds(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function parseSizesFromBody(rawSizes) {
  let parsedSizes = [];
  try {
    parsedSizes = rawSizes ? JSON.parse(rawSizes) : [];
  } catch {
    return null;
  }

  if (
    !Array.isArray(parsedSizes) ||
    parsedSizes.some((row) => !row?.size || row.quantity == null)
  ) {
    return null;
  }

  const sizeMap = new Map();
  for (const row of parsedSizes) {
    const sizeKey = String(row.size).trim().toUpperCase();
    if (!sizeKey) continue;
    sizeMap.set(sizeKey, {
      size: String(row.size).trim(),
      quantity: Number(row.quantity) || 0,
    });
  }

  return Array.from(sizeMap.values());
}

function parseColorsFromBody(body) {
  const colorsRaw = body.colors ?? body.color;
  let parsedColors = [];

  if (colorsRaw) {
    try {
      const parsed =
        typeof colorsRaw === "string" ? JSON.parse(colorsRaw) : colorsRaw;
      if (Array.isArray(parsed)) {
        parsedColors = parsed
          .map((item) =>
            typeof item === "string"
              ? { name: item, hex: null }
              : { name: item?.name, hex: item?.hex ?? null }
          )
          .filter((item) => item.name);
      } else if (typeof parsed === "string") {
        parsedColors = [{ name: parsed, hex: null }];
      }
    } catch {
      if (typeof colorsRaw === "string" && colorsRaw.trim()) {
        parsedColors = [{ name: colorsRaw.trim(), hex: null }];
      }
    }
  }

  if (parsedColors.length === 0) {
    parsedColors = [{ name: "default", hex: null }];
  }

  const colorMap = new Map();
  for (const color of parsedColors) {
    const name = String(color.name).trim();
    if (!name) continue;
    const hex = color.hex ? String(color.hex).trim() : null;
    const key = `${name.toLowerCase()}|${hex || ""}`;
    if (!colorMap.has(key)) {
      colorMap.set(key, { name, hex });
    }
  }

  return Array.from(colorMap.values());
}

function buildVariantCreates(slug, parsedColors, parsedSizes, numericPrice, salePrice) {
  const variantCreates = [];
  let variantIndex = 0;

  for (const colorItem of parsedColors) {
    const colorSlug =
      slugify(String(colorItem.name)).slice(0, 20) || "default";
    for (const row of parsedSizes) {
      variantCreates.push({
        sku: `${slug}-${colorSlug}-${row.size}-${variantIndex++}`.slice(0, 100),
        color: String(colorItem.name).slice(0, 50),
        colorHex: colorItem.hex ? String(colorItem.hex).slice(0, 7) : null,
        size: String(row.size),
        stock: Number(row.quantity) || 0,
        price: new Prisma.Decimal(numericPrice),
        salePrice:
          salePrice != null ? new Prisma.Decimal(salePrice) : null,
      });
    }
  }

  return variantCreates;
}

// @desc    Update product
// @route   PUT /api/admin/product/updateProduct/:id
export const updateProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    productName,
    description,
    price,
    category,
    sizes,
  } = req.body;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!existing) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (!productName?.trim() || !description?.trim() || !price) {
    return res.status(400).json({
      message: "Please provide product name, description, and price",
    });
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({
      message: "Price must be a valid number greater than 0",
    });
  }

  let parsedCategory = category;
  if (typeof category === "string") {
    try {
      parsedCategory = JSON.parse(category);
    } catch {
      parsedCategory = { name: category };
    }
  }

  const categoryRecord = parsedCategory
    ? await resolveCategory(parsedCategory)
    : existing.category;

  let parsedBrand = req.body.brand;
  if (typeof parsedBrand === "string" && parsedBrand) {
    try {
      parsedBrand = JSON.parse(parsedBrand);
    } catch {
      parsedBrand = { name: parsedBrand };
    }
  }
  const brandRecord =
    parsedBrand !== undefined
      ? await resolveBrand(parsedBrand)
      : existing.brand;

  const parsedSizes = parseSizesFromBody(sizes);
  if (!parsedSizes || parsedSizes.length === 0) {
    return res.status(400).json({
      message: "Invalid sizes format. Each size must include size and quantity.",
    });
  }

  const discount = Number(req.body.discount) || 0;
  const salePrice =
    discount > 0 ? numericPrice * (1 - discount / 100) : null;

  const deletedImageIds = parseDeletedImageIds(req.body.deletedImageIds);
  const imagesToRemove = existing.images.filter((img) =>
    deletedImageIds.includes(img.id)
  );

  const remainingImages = existing.images.filter(
    (img) => !deletedImageIds.includes(img.id)
  );
  const remainingImageCount = remainingImages.length + (req.files?.length || 0);

  if (remainingImageCount < 1) {
    return res.status(400).json({
      message: "Product must have at least one image",
    });
  }

  await deleteManyFromCloudinary(imagesToRemove.map((img) => img.imageUrl));

  let newImageUrls = [];
  if (req.files?.length) {
    try {
      for (const file of req.files) {
        const imageUrl = await uploadFileToCloudinary(
          file,
          CLOUDINARY_FOLDERS.PRODUCTS
        );
        newImageUrls.push(imageUrl);
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  const slug =
    existing.title === productName.trim()
      ? existing.slug
      : await uniqueSlug(prisma, productName.trim(), "product");

  const parsedColors = parseColorsFromBody(req.body);
  const variantCreates = buildVariantCreates(
    slug,
    parsedColors,
    parsedSizes,
    numericPrice,
    salePrice
  );

  const product = await prisma.$transaction(async (tx) => {
    if (deletedImageIds.length) {
      await tx.productImage.deleteMany({
        where: { id: { in: deletedImageIds }, productId: id },
      });
    }

    const maxSort = remainingImages.reduce(
      (max, img) => Math.max(max, img.sortOrder ?? 0),
      -1
    );

    if (newImageUrls.length) {
      await tx.productImage.createMany({
        data: newImageUrls.map((url, index) => ({
          productId: id,
          imageUrl: url,
          isPrimary: remainingImages.length === 0 && index === 0,
          sortOrder: maxSort + 1 + index,
        })),
      });
    }

    await tx.productVariant.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
      data: {
        title: productName.trim(),
        slug,
        description,
        shortDescription: req.body.note || "",
        note: req.body.note || "",
        basePrice: new Prisma.Decimal(numericPrice),
        salePrice: salePrice != null ? new Prisma.Decimal(salePrice) : null,
        discountPercent: discount > 0 ? new Prisma.Decimal(discount) : null,
        isReturnable:
          req.body.isReturn === true || req.body.isReturn === "true",
        categoryId: categoryRecord?.id ?? null,
        brandId: brandRecord?.id ?? null,
        variants: { create: variantCreates },
      },
      include: productInclude,
    });
  });

  res.status(200).json({
    message: "Product updated successfully",
    product: toLegacyProduct(product),
  });
});

// @desc    Delete product
// @route   DELETE /api/admin/product/deleteProduct/:id
export const deleteProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await deleteManyFromCloudinary(product.images.map((img) => img.imageUrl));
  await prisma.product.delete({ where: { id } });

  res.status(200).json({ message: "Product deleted successfully" });
});

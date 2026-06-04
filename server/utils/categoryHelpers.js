import prisma from "../lib/prisma.js";
import { uniqueSlug } from "./slugify.js";
import {
  CLOUDINARY_FOLDERS,
  uploadFileToCloudinary,
} from "./cloudinaryUtils.js";

export async function uploadCategoryImage(req) {
  const file = req.file;
  if (!file) return null;

  try {
    return await uploadFileToCloudinary(file, CLOUDINARY_FOLDERS.CATEGORIES);
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function createCategoryRecord({ name, image = null, parentId = null }) {
  const trimmed = String(name).trim();
  const slug = await uniqueSlug(prisma, trimmed, "category");

  return prisma.category.create({
    data: {
      name: trimmed,
      slug,
      image: image || null,
      parentId: parentId || null,
    },
  });
}

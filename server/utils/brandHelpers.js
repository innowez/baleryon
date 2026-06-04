import prisma from "../lib/prisma.js";
import { uniqueSlug } from "./slugify.js";
import {
  CLOUDINARY_FOLDERS,
  uploadFileToCloudinary,
} from "./cloudinaryUtils.js";

export async function uploadBrandLogo(req) {
  const file = req.file;
  if (!file) return null;

  try {
    return await uploadFileToCloudinary(file, CLOUDINARY_FOLDERS.BRANDS);
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function createBrandRecord({ name, logo = null }) {
  const trimmed = String(name).trim();
  const slug = await uniqueSlug(prisma, trimmed, "brand");

  return prisma.brand.create({
    data: {
      name: trimmed,
      slug,
      logo: logo || null,
    },
  });
}

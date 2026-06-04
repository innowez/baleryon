import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
];

const trimEnv = (value) =>
  value
    ? String(value)
        .trim()
        .replace(/^["']|["']$/g, "")
    : undefined;

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: trimEnv(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: trimEnv(process.env.CLOUDINARY_API_KEY),
    api_secret: trimEnv(process.env.CLOUDINARY_API_SECRET),
    secure: true,
  });
}

export const CLOUDINARY_BASE = "baleryon";

/** Section folder names under baleryon/ */
export const CLOUDINARY_FOLDERS = {
  CATEGORIES: "categories",
  BRANDS: "brands",
  PRODUCTS: "products",
  BANNERS: "banners",
  LIMITED_SEASONS: "limited-seasons",
  URBAN_STORIES: "urban-stories",
};

/**
 * Upload a single file (from multer disk storage) to Cloudinary.
 * @param {Object} file - Multer file object with path, mimetype, originalname
 * @param {string} section - Subfolder under baleryon (e.g. "categories", "banners")
 * @returns {Promise<string>} Public URL of the uploaded asset
 */
export const uploadFileToCloudinary = async (file, section) => {
  if (!file?.path) {
    throw new Error("No file provided for upload.");
  }

  if (!section?.trim()) {
    throw new Error("Cloudinary upload section folder is required.");
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Allowed types are JPG, PNG, GIF, WEBP, and MP4.",
    );
  }

  const folder = `${CLOUDINARY_BASE}/${section.trim()}`;

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
    });

    return result.secure_url;
  } catch (error) {
    throw new Error(`Error uploading file to Cloudinary: ${error.message}`);
  } finally {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch {
      // ignore cleanup errors
    }
  }
};

/**
 * Extract Cloudinary public_id from a secure URL.
 * e.g. .../upload/v123/baleryon/products/file.jpg → baleryon/products/file
 */
export function extractPublicIdFromUrl(imageUrl) {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) return null;

  const uploadIndex = imageUrl.indexOf("/upload/");
  if (uploadIndex === -1) return null;

  let path = imageUrl.slice(uploadIndex + "/upload/".length);
  path = path.replace(/^v\d+\//, "");
  const withoutExt = path.replace(/\.[^/.]+$/, "");
  return withoutExt || null;
}

/**
 * Delete an asset from Cloudinary by its URL. No-op for non-Cloudinary URLs.
 */
export async function deleteFileFromCloudinary(imageUrl) {
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    } catch {
      console.warn(`Cloudinary delete failed for ${publicId}:`, error.message);
    }
  }
}

/**
 * Upload a new file and delete the previous Cloudinary asset when present.
 */
export async function replaceCloudinaryAsset(oldUrl, file, section) {
  const newUrl = await uploadFileToCloudinary(file, section);
  if (oldUrl) {
    await deleteFileFromCloudinary(oldUrl);
  }
  return newUrl;
}

export async function deleteManyFromCloudinary(urls = []) {
  await Promise.all(
    urls.filter(Boolean).map((url) => deleteFileFromCloudinary(url))
  );
}

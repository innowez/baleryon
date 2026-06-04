import { uploadFileToCloudinary } from "./cloudinaryUtils.js";

export async function uploadCmsImage(req, section) {
  const file = req.file;
  if (!file) return null;

  try {
    return await uploadFileToCloudinary(file, section);
  } catch (error) {
    throw new Error(error.message);
  }
}

export function parseBoolean(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  return value === "true" || value === "1";
}

export function parseIntField(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

import {
  deleteFileFromCloudinary,
  replaceCloudinaryAsset,
} from "./cloudinaryUtils.js";

/**
 * Apply single-image update: new upload replaces old, or explicit removal clears DB + Cloudinary.
 */
export async function resolveSingleImageUpdate({
  existingUrl,
  newFile,
  section,
  removeImage,
  uploadFn,
}) {
  const shouldRemove =
    removeImage === true ||
    removeImage === "true" ||
    removeImage === "1";

  if (shouldRemove && existingUrl) {
    await deleteFileFromCloudinary(existingUrl);
    return null;
  }

  if (newFile) {
    if (uploadFn) {
      const newUrl = await uploadFn(newFile);
      if (existingUrl) await deleteFileFromCloudinary(existingUrl);
      return newUrl;
    }
    return replaceCloudinaryAsset(existingUrl, newFile, section);
  }

  return undefined;
}

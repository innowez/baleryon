import dotenv from "dotenv";

dotenv.config();

const trimEnv = (value) =>
  value ? String(value).trim().replace(/^["']|["']$/g, "") : undefined;

const getConfig = () => ({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ? process.env.PORT : undefined,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CLOUDINARY_URL: trimEnv(process.env.CLOUDINARY_URL),
  CLOUDINARY_CLOUD_NAME: trimEnv(process.env.CLOUDINARY_CLOUD_NAME),
  CLOUDINARY_API_KEY: trimEnv(process.env.CLOUDINARY_API_KEY),
  CLOUDINARY_API_SECRET: trimEnv(process.env.CLOUDINARY_API_SECRET),
});

const getSanitizedConfig = (config) => {
  const required = ["NODE_ENV", "PORT", "DATABASE_URL", "JWT_SECRET"];
  for (const key of required) {
    if (config[key] === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }

  const hasCloudinaryUrl = Boolean(config.CLOUDINARY_URL);
  const hasCloudinaryKeys =
    config.CLOUDINARY_CLOUD_NAME &&
    config.CLOUDINARY_API_KEY &&
    config.CLOUDINARY_API_SECRET;

  if (!hasCloudinaryUrl && !hasCloudinaryKeys) {
    throw new Error(
      "Missing Cloudinary config: set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
    );
  }

  return config;
};

const config = getConfig();
const sanitizedConfig = getSanitizedConfig(config);

export default sanitizedConfig;

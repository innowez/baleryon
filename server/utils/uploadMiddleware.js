import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ storage });
export const uploadSingleImage = upload.single("image");
export const uploadSingleLogo = upload.single("logo");
export const uploadSingleBackground = upload.single("backgroundImage");
export const uploadProductImages = upload.array("files");

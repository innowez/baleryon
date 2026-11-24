
import express from "express";

import { protect } from "../middlewares/authMiddleware.js";

import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controller/addressController.js";

const router = express.Router();

// Every database address request requires authentication.
router.use(protect);

router.get("/", getAddresses);
router.post("/", createAddress);

router.patch(
  "/:id/default",
  setDefaultAddress
);

router.get("/:id", getAddressById);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;

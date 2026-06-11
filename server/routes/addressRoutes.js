import express from "express";
import {
  createAddress,
  getAddresses,
  deleteAddress,
  updateAddress,
} from "../controller/addressController.js";

const router = express.Router();

router.post("/", createAddress);
router.get("/:userId", getAddresses);
router.delete("/:id", deleteAddress);
router.put("/:id", updateAddress);

export default router;
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

// CREATE ADDRESS
export const createAddress = asyncHandler(async (req, res) => {
  const {
    userId,
    fullName,
    phone,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    country,
    postalCode,
    isDefault = false,
  } = req.body;

  // Validation
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!addressLine1) {
    return res.status(400).json({
      success: false,
      message: "Address line 1 is required",
    });
  }

  // If this address is default, remove default from other addresses
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      fullName: fullName || null,
      phone: phone || null,
      addressLine1,
      addressLine2: addressLine2 || null,
      landmark: landmark || null,
      city: city || null,
      state: state || null,
      country: country || null,
      postalCode: postalCode || null,
      isDefault,
    },
  });

  res.status(201).json({
    success: true,
    message: "Address created successfully",
    data: address,
  });
});

// GET ALL ADDRESSES
export const getAddresses = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(addresses);
});

// DELETE
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.address.delete({
    where: { id },
  });

  res.json({ success: true });
});

// UPDATE
export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const address = await prisma.address.update({
    where: { id },
    data: req.body,
  });

  res.json(address);
});

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
    isDefault,
  } = req.body;

  console.log(req.body,"=================================================================================================");
  
  const address = await prisma.address.create({
    data: {
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
      isDefault: isDefault || false,
    },
  });

  res.status(201).json(address);
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
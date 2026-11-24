
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma.js";

const writableFields = [
  "fullName",
  "phone",
  "addressLine1",
  "addressLine2",
  "landmark",
  "city",
  "state",
  "country",
  "postalCode",
];

function pickFields(body = {}) {
  return Object.fromEntries(
    writableFields
      .filter((key) => body[key] !== undefined)
      .map((key) => [
        key,
        typeof body[key] === "string"
          ? body[key].trim()
          : body[key],
      ])
  );
}

function validateAddress(data) {
  const required = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "country",
    "postalCode",
  ];

  const missing = required.filter(
    (field) =>
      typeof data[field] !== "string" ||
      !data[field].trim()
  );

  return missing.length
    ? `Required fields: ${missing.join(", ")}`
    : null;
}

// GET /api/addresses
export const getAddresses = asyncHandler(
  async (req, res) => {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    res.status(200).json(addresses);
  }
);

// GET /api/addresses/:id
export const getAddressById = asyncHandler(
  async (req, res) => {
    const address = await prisma.address.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    res.status(200).json(address);
  }
);

// POST /api/addresses
export const createAddress = asyncHandler(
  async (req, res) => {
    const data = pickFields(req.body);
    const validationError = validateAddress(data);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const address = await prisma.$transaction(
      async (tx) => {
        const existingCount = await tx.address.count({
          where: { userId: req.user.id },
        });

        const isDefault =
          existingCount === 0 ||
          req.body?.isDefault === true;

        if (isDefault) {
          await tx.address.updateMany({
            where: { userId: req.user.id },
            data: { isDefault: false },
          });
        }

        return tx.address.create({
          data: {
            ...data,
            userId: req.user.id,
            isDefault,
          },
        });
      }
    );

    res.status(201).json({
      success: true,
      message: "Address created successfully.",
      data: address,
    });
  }
);

// PUT /api/addresses/:id
export const updateAddress = asyncHandler(
  async (req, res) => {
    const where = {
      id: req.params.id,
      userId: req.user.id,
    };

    const current = await prisma.address.findFirst({
      where,
    });

    if (!current) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    const data = pickFields(req.body);

    const validationError = validateAddress({
      ...current,
      ...data,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    await prisma.address.updateMany({
      where,
      data,
    });

    const updated = await prisma.address.findFirst({
      where,
    });

    res.status(200).json(updated);
  }
);

// DELETE /api/addresses/:id
export const deleteAddress = asyncHandler(
  async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;

    const deleted = await prisma.$transaction(
      async (tx) => {
        const current = await tx.address.findFirst({
          where: { id, userId },
        });

        if (!current) return false;

        await tx.address.deleteMany({
          where: { id, userId },
        });

        if (current.isDefault) {
          const next = await tx.address.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
          });

          if (next) {
            await tx.address.updateMany({
              where: { id: next.id, userId },
              data: { isDefault: true },
            });
          }
        }

        return true;
      }
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  }
);

// PATCH /api/addresses/:id/default
export const setDefaultAddress = asyncHandler(
  async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;

    const address = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.address.findFirst({
          where: { id, userId },
        });

        if (!existing) return null;

        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });

        await tx.address.updateMany({
          where: { id, userId },
          data: { isDefault: true },
        });

        return tx.address.findFirst({
          where: { id, userId },
        });
      }
    );

    if (!address) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    res.status(200).json(address);
  }
);

import prisma from "../lib/prisma.js";

export const validateCoupon = async (req, res) => {
  try {
    const { body } = req.body;
    const { code, subtotal } = body;

    console.log(req.body, "req.bodyreq.bodyreq.bodyreq.bodyreq.body");

    const coupon = await prisma.coupon.findUnique({
      where: {
        code: code.trim().toUpperCase(),
      },
    });

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        valid: false,
        message: "Coupon is inactive",
      });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({
        valid: false,
        message: "Coupon expired",
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        valid: false,
        message: "Coupon usage limit exceeded",
      });
    }

    if (coupon.minimumOrder && Number(subtotal) < Number(coupon.minimumOrder)) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order ₹${coupon.minimumOrder}`,
      });
    }

    let discount = 0;

    if (coupon.type === "PERCENTAGE") {
      discount = (Number(subtotal) * Number(coupon.value)) / 100;
    } else {
      discount = Number(coupon.value);
    }

    return res.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discount,
      message: "Coupon applied",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      valid: false,
      message: "Server error",
    });
  }
};

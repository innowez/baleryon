import axios from "axios";
import express from "express";

const router = express.Router();

// GET /api/delivery/check/:pincode

router.get("/check/:pincode", async (req, res) => {
  try {
    const { pincode } = req.params;

    const result = await checkDeliveryAvailability(pincode);

    // return res.json({
    //   available: true,
    //   city: codes[0].postal_code.city,
    //   state: codes[0].postal_code.state_code,
    //   message: `Delivery available`,
    // });

    return res.json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      available: false,
      message: "Unable to check delivery",
    });
  }
});

export default router;

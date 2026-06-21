import axios from "axios";

export const checkDeliveryAvailability = async (pincode) => {
  const response = await axios.get(
    `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`,
    {
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
      },
    }
  );

  const codes = response.data.delivery_codes;

  if (!codes || codes.length === 0) {
    return {
      available: false,
      message: "Delivery not available",
    };
  }

  return {
    available: true,
    city: codes[0].postal_code.city,
    state: codes[0].postal_code.state_code,
    message: "Delivery available",
  };
};
import axios from "axios";

export const checkDeliveryAvailability = async (pincode) => {
  console.log("pincode", pincode);

  console.log("DELHIVERY_BASE_URL", process.env.DELHIVERY_BASE_URL);
  console.log("DELHIVERY_API_TOKEN", process.env.DELHIVERY_API_TOKEN);
  
  const response = await axios.get(
    `${process.env.DELHIVERY_BASE_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`,
    {
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
      },
    }
  );

  console.log(JSON.stringify(response.data, null, 2));
  console.log("response.data", response.data);
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
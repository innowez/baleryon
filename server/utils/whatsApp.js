import axios from "axios";

export const sendOTP = async (phone, otp) => {
  try {
    const cleaned = phone.replace(/\D/g, "");
    const recipient = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;

    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: "jaspers_market_order_confirmation_v1",
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: "Raziq", 
                },
                {
                  type: "text",
                  text: otp.toString(), // {{2}} Order Number
                },
                {
                  type: "text",
                  text: "Tomorrow", // {{3}} Estimated Delivery
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("WhatsApp Error:", error.response?.data || error.message);

    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        "Unable to send WhatsApp message.",
      details: error.response?.data || null,
    };
  }
};
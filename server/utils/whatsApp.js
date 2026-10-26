// import axios from "axios";

// export const sendOTP = async (phone, otp) => {
//   try {
//     const cleaned = phone.replace(/\D/g, "");
//     const recipient = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;

//     // const response = await axios.post(
//     //   `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
//     //   {
//     //     messaging_product: "whatsapp",
//     //     to: recipient,
//     //     type: "template",
//     //     template: {
//     //       name: "jaspers_market_order_confirmation_v1",
//     //       language: {
//     //         code: "en_US",
//     //       },
//     //       components: [
//     //         {
//     //           type: "body",
//     //           parameters: [
//     //             {
//     //               type: "text",
//     //               text: "Raziq",
//     //             },
//     //             {
//     //               type: "text",
//     //               text: otp.toString(), // {{2}} Order Number
//     //             },
//     //             {
//     //               type: "text",
//     //               text: "Tomorrow", // {{3}} Estimated Delivery
//     //             },
//     //           ],
//     //         },
//     //       ],
//     //     },
//     //   },
//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
//     //       "Content-Type": "application/json",
//     //     },
//     //   },
//     // );


//     const response = await axios.post(
//       `${process.env.WAKIT_API}/otp/send`,
//       { to: phone },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.WAKIT_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 15000,
//       }
//     );
//     return {
//       success: true,
//       data: response.data,
//     };
//   } catch (error) {
//     console.error("WhatsApp Error:", error.response?.data || error.message);

//     return {
//       success: false,
//       error:
//         error.response?.data?.error?.message ||
//         "Unable to send WhatsApp message.",
//       details: error.response?.data || null,
//     };
//   }
// };




import axios from "axios";

const WAKIT_API = (
  process.env.WAKIT_API || "https://wakit.in/api/v1"
).replace(/\/+$/, "");

const getHeaders = () => ({
  Authorization: `Bearer ${process.env.WAKIT_API_KEY}`,
  "Content-Type": "application/json",
});

const getErrorMessage = (error) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  error.message ||
  "WhatsApp OTP service is unavailable.";

// Send OTP — Wakit generates and sends the code.
export const sendOTP = async (phone) => {
  console.log(phone, "phonephonephonephonephone");
  console.log(process.env.WAKIT_API_KEY, "process.env.WAKIT_API_KEYprocess.env.WAKIT_API_KEYprocess.env.WAKIT_API_KEY");
  
  console.log(getHeaders(), "getHeadersgetHeadersgetHeaders");
  
  console.log(WAKIT_API, "WAKIT_APIWAKIT_APIWAKIT_API");
  
    try {
    if (!process.env.WAKIT_API_KEY) {
      throw new Error("WAKIT_API_KEY is not configured.");
    }

    const response = await axios.post(
      `${WAKIT_API}/otp/send`,
      {
        to: phone,
        code_length: 6,
      },
      {
        headers: getHeaders(),
        timeout: 15000,
      }
    );

    console.log(response.data, "response.dataresponse.dataresponse.data");

    const result = response.data;

    if (!result?.success || !result?.data?.id) {
      return {
        success: false,
        error: result?.error?.message || "Failed to send OTP.",
      };
    }

    return {
      success: true,
      data: {
        id: result.data.id,
        to: result.data.to,
        status: result.data.status,
        expiresAt: result.data.expires_at,
      },
    };
  } catch (error) {
    console.error(
      "Wakit send OTP error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      error: getErrorMessage(error),
      status: error.response?.status || 502,
    };
  }
};

// Verify OTP — Wakit checks the code, expiry and attempt limit.
export const verifyOTP = async (otpId, code) => {
  console.log(otpId, "otpIdotpIdotpId");
  try {
    if (!process.env.WAKIT_API_KEY) {
      throw new Error("WAKIT_API_KEY is not configured.");
    }

    const response = await axios.post(
      `${WAKIT_API}/otp/verify`,
      {
        id: otpId,
        code: String(code).trim(),
      },
      {
        headers: getHeaders(),
        timeout: 15000,
      }
    );

    console.log(response.data, "response.dataresponse.dataresponse.data");
    

    const result = response.data;

    if (!result?.success) {
      return {
        success: false,
        error: result?.error?.message || "OTP verification failed.",
      };
    }

    return {
      success: true,
      verified: result?.data?.verified === true,
      status: result?.data?.status,
    };
  } catch (error) {
    console.error(
      "Wakit verify OTP error:",
      error.response?.data || error.message
    );

    // A provider 4xx response can indicate an invalid/expired code.
    // Other errors may be service/network failures.
    return {
      success: false,
      error: getErrorMessage(error),
      status: error.response?.status || 502,
    };
  }
};

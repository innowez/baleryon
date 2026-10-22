import axios from "axios";

// Delhivery can occasionally hang instead of erroring — cap how long we
// wait so a slow upstream never blocks order creation indefinitely.
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Checks whether Delhivery services a pincode, and whether Cash on
 * Delivery is available there.
 *
 * This function is defensive by design: whatever Delhivery returns (a
 * malformed body, a missing field, a network failure, a timeout), it
 * never throws and never lets a TypeError escape — callers can always
 * safely read `.available` and `.cod` off the result.
 *
 * IMPORTANT: never log DELHIVERY_API_TOKEN or any request headers here.
 */
export const checkDeliveryAvailability = async (pincode) => {
  const normalizedPincode = String(pincode ?? "").trim();

  if (!/^\d{6}$/.test(normalizedPincode)) {
    return {
      available: false,
      cod: false,
      message: "Please enter a valid 6-digit pincode",
    };
  }

  const baseUrl = process.env.DELHIVERY_BASE_URL;
  const token = process.env.DELHIVERY_API_TOKEN;

  if (!baseUrl || !token) {
    console.error(
      "Delhivery is not configured: missing DELHIVERY_BASE_URL or DELHIVERY_API_TOKEN",
    );
    return {
      available: false,
      cod: false,
      message: "Delivery check is temporarily unavailable",
    };
  }

  let response;
  try {
    response = await axios.get(
      `${baseUrl}/c/api/pin-codes/json/?filter_codes=${normalizedPincode}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
    );
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(`Delhivery pincode check timed out for ${normalizedPincode}`);
    } else if (error.response) {
      console.error(
        `Delhivery pincode check failed for ${normalizedPincode}: status ${error.response.status}`,
      );
    } else {
      console.error(
        `Delhivery pincode check failed for ${normalizedPincode}: ${error.message}`,
      );
    }

    return {
      available: false,
      cod: false,
      message: "Unable to check delivery availability right now",
    };
  }

  // ── Defensively unwrap the response shape ───────────────────
  // Expected shape:
  // { delivery_codes: [ { postal_code: { cod: "Y" | "N", city, state_code, ... } } ] }
  const codes = response?.data?.delivery_codes;

  if (!Array.isArray(codes) || codes.length === 0) {
    return {
      available: false,
      cod: false,
      message: "Delivery is not available for this pincode",
    };
  }

  const postalCode = codes[0]?.postal_code;

  if (!postalCode || typeof postalCode !== "object") {
    console.error(
      `Delhivery returned an unexpected response shape for ${normalizedPincode}`,
    );
    return {
      available: false,
      cod: false,
      message: "Delivery is not available for this pincode",
    };
  }

  const isCodAvailable = postalCode.cod === "Y";

  return {
    available: true,
    cod: isCodAvailable,
    city: postalCode.city ?? null,
    state: postalCode.state_code ?? null,
    message: "Delivery available",
  };
};

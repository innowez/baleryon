// services/msg91.js

import axios from "axios";

export async function sendOtp(phone, otp) {
  await axios.post(
    "https://control.msg91.com/api/v5/flow/",
    {
      template_id: process.env.MSG91_TEMPLATE_ID,
      short_url: "0",
      recipients: [
        {
          mobiles: phone.replace("+", ""),
          otp: otp,
        },
      ],
    },
    {
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
      },
    }
  );
}
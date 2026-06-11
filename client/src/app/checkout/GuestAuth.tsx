"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function GuestAuth({
  onVerified,
}: {
  onVerified: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [sent, setSent] = useState(false);

  const requestPhoneOtp = useAuthStore(
    (s) => s.requestPhoneOtp
  );

  const loginWithPhone = useAuthStore(
    (s) => s.loginWithPhone
  );

  const sendOtp = async () => {
    await requestPhoneOtp(phone);
    setSent(true);
  };

  const verifyOtp = async () => {
    await loginWithPhone(phone, otp);

    onVerified();
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <h3 className="font-bold mb-4">
        Continue With Mobile Number
      </h3>

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Mobile Number"
        className="input"
      />

      {!sent ? (
        <button
          onClick={sendOtp}
          className="button-primary mt-4"
        >
          Send OTP
        </button>
      ) : (
        <>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP"
            className="input mt-4"
          />

          <button
            onClick={verifyOtp}
            className="button-primary mt-4"
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
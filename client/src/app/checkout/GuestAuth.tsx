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

  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");

  const requestPhoneOtp = useAuthStore((s) => s.requestPhoneOtp);
  const loginWithPhone = useAuthStore((s) => s.loginWithPhone);

  const validatePhone = () => {
    if (!phone.trim()) {
      setPhoneError("Mobile number is required.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError("Enter a valid 10-digit mobile number.");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const sendOtp = async () => {
    if (!validatePhone()) return;

    await requestPhoneOtp(phone);
    setSent(true);
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter the OTP.");
      return;
    }

    setOtpError("");

    await loginWithPhone(phone, otp);
    onVerified();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-xl font-bold text-[#0F0F0F]">
        Continue with Mobile Number
      </h3>

      <p className="text-sm text-gray-500 mt-1 mb-6">
        Enter your mobile number to receive a one-time password.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Mobile Number
          </label>

          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ""));
              setPhoneError("");
            }}
            placeholder="Enter 10-digit mobile number"
            className={`w-full rounded-xl border px-4 py-3 outline-none transition-all
              ${
                phoneError
                  ? "border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
              }`}
          />

          {phoneError && (
            <p className="mt-1 text-sm text-red-500">{phoneError}</p>
          )}
        </div>

        {sent && (
          <div>
            <label className="block text-sm font-semibold mb-2">
              OTP
            </label>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setOtpError("");
              }}
              placeholder="Enter OTP"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition-all
                ${
                  otpError
                    ? "border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                }`}
            />

            {otpError && (
              <p className="mt-1 text-sm text-red-500">{otpError}</p>
            )}
          </div>
        )}

        {!sent ? (
          <button
            onClick={sendOtp}
            className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-black/90 active:scale-[0.98]"
          >
            Send OTP
          </button>
        ) : (
          <button
            onClick={verifyOtp}
            className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-black/90 active:scale-[0.98]"
          >
            Verify OTP
          </button>
        )}
      </div>
    </div>
  );
}
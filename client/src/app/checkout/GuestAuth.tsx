"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  onVerified: () => void;
  onContinueAsGuest?: () => void;
};

const RESEND_SECONDS = 30;

export default function GuestAuth({ onVerified, onContinueAsGuest }: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");

  const [sent, setSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [nameError, setNameError] = useState("");

  const requestAuthOtp = useAuthStore((s) => s.requestAuthOtp);

  const loginWithPhone = useAuthStore((s) => s.loginWithPhone);

  const signupWithPhone = useAuthStore((s) => s.signupWithPhone);

  useEffect(() => {
    if (resendIn <= 0) return;

    const timer = setTimeout(() => {
      setResendIn((n) => n - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendIn]);

  const validatePhone = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError("Enter a valid 10-digit mobile number.");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const sendOtp = async () => {
    if (!validatePhone()) return;

    setLoading(true);
    setPhoneError("");

    try {
      // Supports both existing and new users
      const response = await requestAuthOtp(phone);

      setIsNewUser(response.isNewUser);
      setSent(true);
      setOtp("");
      setOtpError("");
      setResendIn(RESEND_SECONDS);
    } catch (error) {
      setPhoneError(
        error instanceof Error
          ? error.message
          : "Could not send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter a valid 6-digit OTP.");
      return;
    }

    if (isNewUser && !fullName.trim()) {
      setNameError("Full name is required.");
      return;
    }

    setLoading(true);
    setOtpError("");
    setNameError("");

    try {
      if (isNewUser) {
        // New user -> register after OTP verification
        await signupWithPhone(phone, otp, fullName.trim());
      } else {
        // Existing user -> login after OTP verification
        await loginWithPhone(phone, otp);
      }

      // Both store methods save user and JWT
      onVerified();
    } catch (error) {
      setOtpError(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const changeNumber = () => {
    setSent(false);
    setOtp("");
    setFullName("");
    setIsNewUser(false);
    setPhoneError("");
    setOtpError("");
    setNameError("");
    setResendIn(0);
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-3 outline-none transition-all ${
      hasError
        ? "border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
    }`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-[#0F0F0F]">Login or Register</h3>

      <p className="mt-1 mb-6 text-sm text-gray-500">
        Enter your mobile number to continue. Existing customers can log in, and
        new customers can create an account using OTP.
      </p>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();

          if (loading) return;

          if (sent) {
            void verifyOtp();
          } else {
            void sendOtp();
          }
        }}
      >
        {/* PHONE NUMBER */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Mobile Number
          </label>

          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={phone}
            disabled={sent}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ""));
              setPhoneError("");
            }}
            placeholder="Enter 10-digit mobile number"
            className={`${inputClass(
              !!phoneError,
            )} disabled:bg-gray-50 disabled:text-gray-500`}
          />

          {phoneError && (
            <p className="mt-1 text-sm text-red-500">{phoneError}</p>
          )}

          {sent && (
            <button
              type="button"
              onClick={changeNumber}
              className="mt-2 text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-black"
            >
              Change number
            </button>
          )}
        </div>

        {/* NEW USER FULL NAME */}
        {sent && isNewUser && (
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Full Name
            </label>

            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setNameError("");
              }}
              placeholder="Enter your full name"
              className={inputClass(!!nameError)}
            />

            {nameError && (
              <p className="mt-1 text-sm text-red-500">{nameError}</p>
            )}
          </div>
        )}

        {/* OTP INPUT */}
        {sent && (
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Enter OTP sent to +91 {phone}
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setOtpError("");
              }}
              placeholder="Enter 6-digit OTP"
              className={inputClass(!!otpError)}
            />

            {otpError && (
              <p className="mt-1 text-sm text-red-500">{otpError}</p>
            )}

            {/* RESEND OTP */}
            <div className="mt-2 text-sm text-gray-500">
              {resendIn > 0 ? (
                <span>Resend OTP in {resendIn}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void sendOtp()}
                  disabled={loading}
                  className="font-medium text-gray-700 underline underline-offset-2 hover:text-black disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-black/90 active:scale-[0.98] disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : !sent
              ? "Send OTP"
              : isNewUser
                ? "Verify OTP & Register"
                : "Verify OTP & Login"}
        </button>
      </form>

      {/* CONTINUE AS GUEST */}
      {onContinueAsGuest && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            or
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-[#0F0F0F] transition hover:border-black active:scale-[0.98]"
          >
            Continue as guest
          </button>
        </>
      )}
    </div>
  );
}

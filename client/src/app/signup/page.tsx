"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Mail, Lock, Phone, Eye, EyeOff, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle, requestPhoneOtp, signupWithPhone } =
    useAuthStore();

  const [authMethod, setAuthMethod] = useState<"phone">("phone");
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpInfo, setOtpInfo] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const switchMethod = (method: "phone") => {
    setAuthMethod(method);
    setError("");
    setOtpInfo("");
    setPhoneStep("phone");
  };

  const validateEmailForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    // if (!formData.email.trim()) {
    //   setError("Email is required");
    //   return false;
    // }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // const handleEmailSignup = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validateEmailForm()) return;

  //   setIsLoading(true);
  //   setError("");

  //   try {
  //     await signup(formData.email, formData.password, formData.fullName);
  //     router.push("/");
  //   } catch (err) {
  //     setError(
  //       err instanceof Error ? err.message : "Signup failed. Please try again."
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const devOtp = await requestPhoneOtp(formData.phone);
      setOtpInfo(
        devOtp
          ? `We sent a 6-digit code to ${formData.phone}. Dev OTP (no SMS configured): ${devOtp}`
          : `We sent a 6-digit code to ${formData.phone}.`,
      );
      setPhoneStep("otp");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signupWithPhone(formData.phone, formData.otp, formData.fullName);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Signup failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");

    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google signup failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container-max py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            BALERYON
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-[#0F0F0F] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join BALERYON today</p>
          </div>

          {/* Social Signup Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* <button
              onClick={() => switchMethod("phone")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone className="w-5 h-5" />
              Continue with Phone Number
            </button> */}
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* OTP Info Message */}
          {otpInfo && authMethod === "phone" && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {otpInfo}
            </div>
          )}

          {/* Auth Method Toggle */}
          {/* <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => switchMethod("email")}
              className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${
                authMethod === "email"
                  ? "bg-white text-[#0F0F0F] shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => switchMethod("phone")}
              className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${
                authMethod === "phone"
                  ? "bg-white text-[#0F0F0F] shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Phone
            </button>
          </div> */}

          {/* Email Signup Form */}
          {/* {authMethod === "email" && (
            <form onSubmit={handleEmailSignup}>
              <div className="space-y-4"> */}
          {/* Full Name Input */}
          {/* <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0F0F0F] focus:outline-none transition-colors"
                    />
                  </div>
                </div> */}

          {/* Email Input */}
          {/* <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0F0F0F] focus:outline-none transition-colors"
                    />
                  </div>
                </div> */}

          {/* Password Input */}
          {/* <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="At least 8 characters"
                      required
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0F0F0F] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div> */}

          {/* Confirm Password Input */}
          {/* <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter your password"
                      required
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0F0F0F] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div> */}

          {/* Terms and Conditions */}
          {/* <p className="text-xs text-gray-600">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/terms-and-conditions"
                    className="font-semibold text-[#0F0F0F] hover:underline"
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-semibold text-[#0F0F0F] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>

                {/* Submit Button */}
          {/* <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0F0F0F] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2F2F2F] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          )} */}

          {/* Phone Signup Form (collect name + phone) */}
          {authMethod === "phone" && phoneStep === "phone" && (
            <form onSubmit={handleSendOtp}>
              <div className="space-y-4">
                {/* Full Name Input */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0F0F0F] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0F0F0F] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <p className="text-xs text-gray-600">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/terms-and-conditions"
                    className="font-semibold text-[#0F0F0F] hover:underline"
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-semibold text-[#0F0F0F] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0F0F0F] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2F2F2F] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Phone Signup Form (verify OTP) */}
          {authMethod === "phone" && phoneStep === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <div className="space-y-4">
                {/* Full Name (read-only confirmation) */}
                <div>
                  <label
                    htmlFor="fullNameConfirm"
                    className="block text-sm font-semibold mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="fullNameConfirm"
                      value={formData.fullName}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                {/* OTP Input */}
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold mb-2"
                  >
                    Enter OTP
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      placeholder="6-digit code"
                      required
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl tracking-[0.5em] focus:border-[#0F0F0F] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0F0F0F] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2F2F2F] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify & Create Account"}
                </button>

                {/* Secondary actions */}
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep("phone");
                      setFormData({ ...formData, otp: "" });
                      setOtpInfo("");
                      setError("");
                    }}
                    className="font-semibold text-gray-600 hover:text-[#0F0F0F]"
                  >
                    ← Change number
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="font-semibold text-[#0F0F0F] hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0F0F0F] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200">
        <div className="container-max text-center text-sm text-gray-600">
          <p>© 2026 BALERYON. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

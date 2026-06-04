import { NextResponse } from "next/server";
import { signupWithPhone } from "@/lib/server/auth";

// @desc    Register a new user with phone + OTP
// @route   POST /api/auth/signup/phone
// @access  Public
export async function POST(request: Request) {
  let body: { phone?: string; otp?: string; fullName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (!body.phone || !body.otp || !body.fullName) {
    return NextResponse.json(
      { message: "Please provide phone, OTP, and full name" },
      { status: 400 }
    );
  }

  const result = signupWithPhone(body.phone, body.otp, body.fullName);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json(
    { message: result.message, user: result.user, token: result.token },
    { status: result.status }
  );
}

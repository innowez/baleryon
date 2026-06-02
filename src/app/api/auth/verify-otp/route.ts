import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/server/auth";

// @desc    Verify an OTP and log the user in (creating the account if needed)
// @route   POST /api/auth/verify-otp
// @access  Public
export async function POST(request: Request) {
  let body: { phone?: string; otp?: string; fullName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (!body.phone || !body.otp) {
    return NextResponse.json(
      { message: "Please provide phone and OTP" },
      { status: 400 }
    );
  }

  const result = verifyOtp(body.phone, body.otp, body.fullName);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json(
    { message: result.message, user: result.user, token: result.token },
    { status: result.status }
  );
}

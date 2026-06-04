import { NextResponse } from "next/server";
import { createOtp } from "@/lib/server/auth";

// @desc    Send an OTP to a phone number
// @route   POST /api/auth/send-otp
// @access  Public
export async function POST(request: Request) {
  let body: { phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (!body.phone) {
    return NextResponse.json(
      { message: "Please provide a phone number" },
      { status: 400 }
    );
  }

  const result = await createOtp(body.phone);

  return NextResponse.json({ message: result.message }, { status: result.status });
}

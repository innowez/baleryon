import { NextResponse } from "next/server";
import { loginWithPhone } from "@/lib/server/auth";

// @desc    Log a user in with phone + OTP
// @route   POST /api/auth/login/phone
// @access  Public
export async function POST(request: Request) {
  let body: { phone?: string; otp?: string };
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

  const result = loginWithPhone(body.phone, body.otp);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json(
    { message: result.message, user: result.user, token: result.token },
    { status: result.status }
  );
}

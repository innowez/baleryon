---
name: testing-phone-otp
description: Test the OTP-only phone authentication flow (split signup/login) end-to-end. Use when verifying phone auth UI or API changes in the baleryon Next.js app.
---

# Testing the Phone OTP Auth Flow

The baleryon app has an OTP-only phone auth path (no password) on `/login` and `/signup`, alongside email/password and Google. Phone signup and login use **separate** endpoints:
- `POST /api/auth/signup/phone` — creates an account (409 if the number already exists).
- `POST /api/auth/login/phone` — authenticates an existing account (404 "No account found..." if not).
- `POST /api/auth/send-otp` — issues a 6-digit code. Response is ONLY `{"message":"OTP sent successfully"}` — the code is never returned to the client.

Key logic lives in `src/lib/server/auth.ts` (`createOtp`, `signupWithPhone`, `loginWithPhone`, shared `consumeOtp`), SMS in `src/lib/server/sms.ts`, wired through `src/store/useAuthStore.ts` and the `/login` + `/signup` pages.

## Running locally

```bash
cd <repo> && npm install && npm run dev   # http://localhost:3000
```

The OTP+user store is **in-memory** and single-instance. Restarting the dev server wipes all registered users and pending OTPs. Use fresh/unique phone numbers per run to avoid 409 collisions. If you see stale behavior, kill leftover servers: `pkill -9 -f next-server; pkill -9 -f 'next dev'` then restart.

## Getting the OTP code (important)

The OTP is **never shown in the browser**. Delivery:
- If Twilio is configured (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` or `TWILIO_MESSAGING_SERVICE_SID`), it is sent via SMS.
- In dev without Twilio, it is printed to the **server console only**: `[auth] OTP for {phone}: NNNNNN`. Read it from the dev-server stdout (the shell running `npm run dev`), NOT the screen.
- In production without Twilio configured, send-otp returns an error (500) instead of leaking the code.

The on-screen green info box now only says "We sent a 6-digit code to {phone}." with no digits — confirming this (no code, no "Dev OTP" text) is the core secrecy assertion. To prove no leak at the API level: `curl -s -X POST localhost:3000/api/auth/send-otp -H 'Content-Type: application/json' -d '{"phone":"+15558889999"}'` should return exactly `{"message":"OTP sent successfully"}`.

## UI path

Both pages default to the **Email** tab. Click the **Phone** toggle (or "Continue with Phone Number") to switch. Signup's phone form also requires Full Name before Send OTP. After Send OTP the form swaps the phone input for an OTP input; the layout shifts, so re-screenshot before clicking fields rather than reusing old coordinates.

To log out between tests, click the **Account** button in the header (auth state persists in localStorage via zustand, so a page reload alone won't reset it).

## Core test cases

1. **Signup creates account (primary):** `/signup` → Phone → name + new number → Send OTP → read code from server log → enter it → "Verify & Create Account" → redirects to `/`, header shows "Account".
2. **OTP secrecy (adversarial, most important):** after Send OTP, the green box must show only "We sent a 6-digit code to {phone}." and the send-otp response body must NOT contain `devOtp` or any 6-digit code. If a code appears in either place, the secure-OTP change is broken.
3. **Login rejects unknown number:** `/login` → Phone → a never-registered number → Send OTP → enter the *correct* server-log code → must be rejected with "No account found with this phone number. Please sign up." and stay logged out.
4. **Login succeeds for registered number:** `/login` → Phone → the number from case 1 → Send OTP → enter server-log code → redirects to `/`, header shows "Account".
5. **Wrong OTP:** any wrong code → "Invalid OTP. Please try again.", stays on OTP step.

## Caveats

- On serverless/multi-instance deploys (e.g. Netlify), send-otp and verify can hit different instances, so verify may fail across instances — this is expected for the in-memory store; a real deploy needs a shared store + the Twilio SMS provider.
- Next.js 16 has breaking changes; consult `node_modules/next/dist/docs/` before editing route handlers.

## Devin Secrets Needed

- None for the local dev secrecy test (OTP read from server console).
- To exercise real SMS delivery: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` (or `TWILIO_MESSAGING_SERVICE_SID`).

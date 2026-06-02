---
name: testing-phone-otp
description: Test the OTP-only phone authentication flow (split signup/login) end-to-end. Use when verifying phone auth UI or API changes in the baleryon Next.js app.
---

# Testing the Phone OTP Auth Flow

The baleryon app has an OTP-only phone auth path (no password) on `/login` and `/signup`, alongside email/password and Google. Phone signup and login use **separate** endpoints:
- `POST /api/auth/signup/phone` — creates an account (409 if the number already exists).
- `POST /api/auth/login/phone` — authenticates an existing account (404 "No account found..." if not).
- `POST /api/auth/send-otp` — issues a 6-digit code.

Key logic lives in `src/lib/server/auth.ts` (`signupWithPhone`, `loginWithPhone`, shared `consumeOtp`), wired through `src/store/useAuthStore.ts` and the `/login` + `/signup` pages.

## Running locally

```bash
cd <repo> && npm install && npm run dev   # http://localhost:3000
```

The OTP+user store is **in-memory** and single-instance. Restarting the dev server wipes all registered users and pending OTPs. Use fresh/unique phone numbers per run to avoid 409 collisions. If you see stale behavior (e.g. an old endpoint responding), kill leftover servers: `pkill -9 -f next-server; pkill -9 -f 'next dev'` then restart.

No SMS provider is configured, so in dev the OTP is shown on-screen in a green info box ("Dev OTP (no SMS configured): NNNNNN"). Read it from the screen/DOM — no external inbox needed. (This visibility is gated on `NODE_ENV !== 'production'`, so it may not appear on prod-mode builds.)

## UI path

Both pages default to the **Email** tab. Click the **Phone** toggle (or "Continue with Phone Number") to switch. Signup's phone form also requires Full Name before Send OTP. After Send OTP the form swaps the phone input for an OTP input; the layout shifts, so re-screenshot before clicking fields rather than reusing old coordinates.

To log out between tests, click the **Account** button in the header (auth state persists in localStorage via zustand, so a page reload alone won't reset it).

## Core test cases

1. **Signup creates account (primary):** `/signup` → Phone → name + new number → Send OTP → enter dev code → "Verify & Create Account" → redirects to `/`, header shows "Account".
2. **Login rejects unknown number (adversarial, most important):** `/login` → Phone → a number that was never registered → Send OTP → enter the *correct* dev code → must be rejected with "No account found with this phone number. Please sign up." and stay logged out. This proves login does not auto-create accounts.
3. **Login succeeds for registered number:** `/login` → Phone → the number registered in case 1 → Send OTP → enter dev code → redirects to `/`, header shows "Account".
4. **Wrong OTP:** any wrong code → "Invalid OTP. Please try again.", stays on OTP step.

## Caveats

- On serverless/multi-instance deploys (e.g. Netlify), send-otp and verify can hit different instances, so verify may fail across instances — this is expected for the in-memory store; a real deploy needs a shared store + SMS provider (point `NEXT_PUBLIC_API_URL` at the Express backend).
- Next.js 16 has breaking changes; consult `node_modules/next/dist/docs/` before editing route handlers.

## Devin Secrets Needed

None — runs fully locally with the in-memory dev backend.

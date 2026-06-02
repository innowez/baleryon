/**
 * SMS delivery for the phone-OTP flow.
 *
 * Uses Twilio when credentials are present. Configuration is read from the
 * environment so secrets never live in the codebase:
 *
 *   TWILIO_ACCOUNT_SID            - Twilio account SID
 *   TWILIO_AUTH_TOKEN             - Twilio auth token
 *   TWILIO_FROM_NUMBER           - a Twilio phone number (E.164, e.g. +15555550100)
 *   TWILIO_MESSAGING_SERVICE_SID - (optional) Messaging Service SID, preferred over
 *                                  TWILIO_FROM_NUMBER when set
 *
 * The Twilio SDK is imported lazily so the rest of the app (and builds) do not
 * depend on it being installed/configured.
 */

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)
  );
}

/**
 * Send an SMS via Twilio. Throws if the provider is not configured or the
 * provider call fails — callers decide how to surface that to the user.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || (!from && !messagingServiceSid)) {
    throw new Error("SMS provider is not configured");
  }

  const { default: twilio } = await import("twilio");
  const client = twilio(accountSid, authToken);

  await client.messages.create({
    to,
    body,
    ...(messagingServiceSid ? { messagingServiceSid } : { from: from as string }),
  });
}

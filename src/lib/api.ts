/**
 * Tiny fetch wrapper for the auth API.
 *
 * The base URL is configurable via `NEXT_PUBLIC_API_URL`. When it is unset the
 * app talks to its own Next.js route handlers under `/api` (see
 * `src/app/api/auth/*`), which act as a self-contained dev backend. Point
 * `NEXT_PUBLIC_API_URL` at an external backend (e.g. the Express service) to
 * use that instead.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiPost<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // No JSON body — leave data as null.
  }

  if (!res.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      "Something went wrong. Please try again.";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

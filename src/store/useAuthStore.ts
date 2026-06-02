import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiPost, type ApiUser } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
}

interface AuthResponse {
  message: string;
  user: ApiUser;
  token: string;
}

interface SendOtpResponse {
  message: string;
  /** Present only outside production so the flow is testable without SMS. */
  devOtp?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  /** Request an OTP for the given phone number. Returns the dev OTP in non-prod. */
  requestPhoneOtp: (phone: string) => Promise<string | undefined>;
  /** Verify an OTP and log in (existing user) or create the account. */
  verifyPhoneOtp: (
    phone: string,
    otp: string,
    fullName?: string
  ) => Promise<void>;
}

function mapUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.fullName,
    phone: apiUser.phone ?? undefined,
    avatar: apiUser.avatar ?? undefined,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (email: string, password: string) => {
        // Mock email login - in production this would call your API.
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser: User = {
          id: "user-123",
          email,
          name: email.split("@")[0],
        };

        set({ user: mockUser, isLoggedIn: true });
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
      },

      signup: async (email: string, password: string, name: string) => {
        // Mock email signup - in production this would call your API.
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          name,
        };

        set({ user: mockUser, isLoggedIn: true });
      },

      loginWithGoogle: async () => {
        // Placeholder until Google OAuth is wired up on the backend.
        throw new Error("Google login is not available yet.");
      },

      requestPhoneOtp: async (phone: string) => {
        const data = await apiPost<SendOtpResponse>("/api/auth/send-otp", {
          phone,
        });
        return data.devOtp;
      },

      verifyPhoneOtp: async (phone: string, otp: string, fullName?: string) => {
        const data = await apiPost<AuthResponse>("/api/auth/verify-otp", {
          phone,
          otp,
          ...(fullName ? { fullName } : {}),
        });

        set({
          user: mapUser(data.user),
          token: data.token,
          isLoggedIn: true,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

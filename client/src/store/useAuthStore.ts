import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiPost, type ApiUser } from "@/lib/api";

import { useCartStore, clearGuestCartStorage } from "@/store/useCartStore";

import {
  useWishlistStore,
  clearGuestWishlistStorage,
} from "@/store/useWishlistStore";
import { useAddressStore, stashGuestAddresses } from "./useAddressStore";

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
  /** "LOGIN" | "REGISTER" (returned by /api/auth/signup/phone) */
  action?: "LOGIN" | "REGISTER";
}

interface SendOtpResponse {
  message: string;
  /** Present only outside production so the flow is testable without SMS. */
  devOtp?: string;
}

interface SendAuthOtpResponse {
  success: boolean;
  message: string;
  /** true = no account for this number yet, so the name is required. */
  isNewUser: boolean;
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
  requestSignupPhoneOtp: (phone: string) => Promise<string | undefined>;
  /**
   * Send an OTP for EITHER login or register. The result says whether this
   * number is new (so the UI can ask for a name).
   */
  requestAuthOtp: (phone: string) => Promise<{ isNewUser: boolean }>;
  /**
   * Verify OTP. Existing number -> logs in. New number -> registers
   * (fullName required). Token is persisted in localStorage ("auth-storage").
   */
  signupWithPhone: (
    phone: string,
    otp: string,
    fullName: string,
  ) => Promise<void>;
  /** Log an existing user in with phone + OTP. */
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
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
        // Clear authentication state and persisted auth data.
        set({
          user: null,
          token: null,
          isLoggedIn: false,
        });

        // Remove guest cart and wishlist from localStorage.
        clearGuestCartStorage();
        clearGuestWishlistStorage();

        useAddressStore.getState().clearAddresses();

        // Switch both stores to empty guest sessions.
        // This does NOT delete database cart/wishlist records.
        void useCartStore.getState().setSession(false);
        void useWishlistStore.getState().setSession("guest");

        console.log("Logged out: local cart and wishlist cleared.");
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

      requestSignupPhoneOtp: async (phone: string) => {
        const data = await apiPost<SendOtpResponse>(
          "/api/auth/signup/send-otp",
          { phone },
        );

        return data.devOtp;
      },

      requestAuthOtp: async (phone: string) => {
        const data = await apiPost<SendAuthOtpResponse>(
          "/api/auth/phone/send-otp",
          { phone },
        );

        return { isNewUser: data.isNewUser };
      },

      signupWithPhone: async (phone: string, otp: string, fullName: string) => {
        const data = await apiPost<AuthResponse>("/api/auth/signup/phone", {
          phone,
          otp,
          fullName,
        });

        // Copy guest addresses BEFORE auth state flips (see useAddressStore).
        stashGuestAddresses();

        set({
          user: mapUser(data.user),
          token: data.token,
          isLoggedIn: true,
        });
      },

      loginWithPhone: async (phone: string, otp: string) => {
        const data = await apiPost<AuthResponse>("/api/auth/login/phone", {
          phone,
          otp,
        });

        stashGuestAddresses();

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
    },
  ),
);

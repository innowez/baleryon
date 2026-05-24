import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: async (email: string, password: string) => {
        // Mock login - in production, this would call your API
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser: User = {
          id: "user-123",
          email,
          name: email.split("@")[0],
        };

        set({
          user: mockUser,
          isLoggedIn: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
        });
      },

      signup: async (email: string, password: string, name: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          name,
        };

        set({
          user: mockUser,
          isLoggedIn: true,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

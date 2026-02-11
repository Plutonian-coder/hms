import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile, UserRole } from "@/types";

interface AuthState {
  token: string | null;
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: Profile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      setAuth: (token, user) =>
        set({
          token,
          user,
          role: user.role,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          token: null,
          user: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "hms-auth",
    }
  )
);

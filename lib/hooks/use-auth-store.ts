"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { SESSION_COOKIE, USER_COOKIE } from "@/lib/constants";
import { authApi } from "@/lib/api/auth";
import type { LoginResponse } from "@/lib/types/api";

export interface AuthUser {
  userId: number;
  username: string;
  fullName: string;
  roleName: string;
  expiresAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrate: () => void;
  setSession: (login: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  hydrate: () => {
    const raw = Cookies.get(USER_COOKIE);
    const token = Cookies.get(SESSION_COOKIE);
    if (raw && token) {
      try {
        const user = JSON.parse(raw) as AuthUser;
        set({ user, isAuthenticated: true, isHydrated: true });
        return;
      } catch {
        // fall through to unauthenticated state
      }
    }
    set({ user: null, isAuthenticated: false, isHydrated: true });
  },

  setSession: async (login) => {
    const user: AuthUser = {
      userId: login.userId,
      username: login.username,
      fullName: login.fullName,
      roleName: login.roleName,
      expiresAt: login.expiresAt,
    };
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...login }),
    });
    set({ user, isAuthenticated: true, isHydrated: true });
  },

  logout: async () => {
    try {
      if (get().isAuthenticated) {
        await authApi.logout();
      }
    } catch {
      // token may already be invalid/expired server-side — proceed with local cleanup regardless
    } finally {
      await fetch("/api/session", { method: "DELETE" });
      set({ user: null, isAuthenticated: false, isHydrated: true });
    }
  },
}));

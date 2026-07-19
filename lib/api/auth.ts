import { apiFetch } from "@/lib/api-client";
import type {
  LoginRequest, LoginResponse, ChangePasswordRequest,
} from "@/lib/types/api";

export const authApi = {
  login: (body: LoginRequest) =>
    apiFetch<LoginResponse>("/auth/login", { method: "POST", body, skipAuth: true }),

  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),

  changePassword: (userId: number, body: ChangePasswordRequest) =>
    apiFetch<void>(`/auth/users/${userId}/change-password`, { method: "POST", body }),

  requestPasswordReset: (email: string) =>
    apiFetch<void>("/auth/password-reset/request", { method: "POST", body: { email }, skipAuth: true }),

  confirmPasswordReset: (resetToken: string, newPassword: string) =>
    apiFetch<void>("/auth/password-reset/confirm", {
      method: "POST",
      body: { resetToken, newPassword },
      skipAuth: true,
    }),
};

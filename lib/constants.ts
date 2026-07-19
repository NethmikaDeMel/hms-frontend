export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
export const API_PREFIX = "/api/v1";

export const SESSION_COOKIE = "hms_token";
export const USER_COOKIE = "hms_user";

// Idle-session policy (see build prompt §3.2): 25 min idle -> warning modal
// with a 5 min countdown -> auto logout at 30 min total idle time.
export const IDLE_WARNING_MS = 25 * 60 * 1000;
export const IDLE_LOGOUT_MS = 30 * 60 * 1000;

export const ROLES = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  NURSE: "NURSE",
  RECEPTIONIST: "RECEPTIONIST",
  LAB_TECH: "LAB_TECH",
  PHARMACIST: "PHARMACIST",
  ACCOUNTANT: "ACCOUNTANT",
} as const;
export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const CURRENCY = "LKR";
export const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
});

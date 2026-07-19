import Cookies from "js-cookie";
import { API_BASE_URL, API_PREFIX, SESSION_COOKIE } from "@/lib/constants";
import { ApiError, type ApiErrorShape } from "@/lib/types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Skip attaching the Authorization header (only needed for /auth/login). */
  skipAuth?: boolean;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_PREFIX}${path}`, API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

/**
 * Thin fetch wrapper used by every lib/api/*.ts module. Injects the bearer
 * token, parses the backend's uniform error contract into a typed ApiError,
 * and returns already-parsed JSON (or undefined for 204 No Content).
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, skipAuth } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!skipAuth) {
    const token = Cookies.get(SESSION_COOKIE);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const shape: ApiErrorShape = data ?? {
      timestamp: new Date().toISOString(),
      status: response.status,
      error: "UNKNOWN_ERROR",
      message: response.statusText || "Something went wrong.",
      details: [],
    };
    throw new ApiError(shape);
  }

  return data as T;
}

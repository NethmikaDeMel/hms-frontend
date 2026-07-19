import { toast } from "sonner";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { ApiError } from "@/lib/types/api";

/** Human-readable fallback per error code, used when the backend message is terse. */
const CODE_LABELS: Record<string, string> = {
  VALIDATION_FAILED: "Please check the highlighted fields.",
  RESOURCE_NOT_FOUND: "That record couldn't be found.",
  ENTITY_NOT_FOUND: "That record couldn't be found.",
  BUSINESS_RULE_VIOLATION: "That action isn't allowed right now.",
  DATA_INTEGRITY_VIOLATION: "That conflicts with an existing record.",
  AUTHENTICATION_FAILED: "Your session is no longer valid.",
  TYPE_MISMATCH: "One of the values provided isn't valid.",
  INVALID_REQUEST: "That request couldn't be processed.",
  INTERNAL_SERVER_ERROR: "Something went wrong on our end.",
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || CODE_LABELS[error.code] || "Something went wrong.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

/** Shows a toast for any caught error, using the ApiError message/code when available. */
export function notifyError(error: unknown, fallbackTitle = "Action failed") {
  const message = getErrorMessage(error);
  toast.error(fallbackTitle, { description: message });
}

/**
 * Maps a VALIDATION_FAILED ApiError's `details` (each formatted as
 * "fieldName: message") back onto react-hook-form fields via setError,
 * falling back to a plain toast for anything that doesn't map to a field.
 */
export function applyApiErrorToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
) {
  if (error instanceof ApiError && error.code === "VALIDATION_FAILED" && error.details.length > 0) {
    let mapped = 0;
    for (const detail of error.details) {
      const separatorIndex = detail.indexOf(":");
      if (separatorIndex === -1) continue;
      const field = detail.slice(0, separatorIndex).trim();
      const message = detail.slice(separatorIndex + 1).trim();
      setError(field as Path<T>, { type: "server", message });
      mapped++;
    }
    if (mapped > 0) return;
  }
  notifyError(error);
}

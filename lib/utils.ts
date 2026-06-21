import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "object") {
    const err = error as Record<string, unknown>;

    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }

    if (typeof err.error === "string" && err.error.trim()) {
      return err.error;
    }

    if (typeof err.detail === "string" && err.detail.trim()) {
      return err.detail;
    }

    if (typeof err.title === "string" && err.title.trim()) {
      return err.title;
    }

    if (err.error && typeof err.error === "object") {
      const nested = err.error as Record<string, unknown>;
      if (typeof nested.message === "string" && nested.message.trim()) {
        return nested.message;
      }
    }

    if (Array.isArray(err.errors) && err.errors.length > 0) {
      const first = err.errors[0];
      if (typeof first === "string") {
        return first;
      }
      if (typeof first === "object" && first !== null) {
        const nested = first as Record<string, unknown>;
        if (typeof nested.message === "string" && nested.message.trim()) {
          return nested.message;
        }
      }
    }
  }

  return fallback;
}

"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RateLimitListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        // @ts-ignore
        const detail = e?.detail || {};
        const retryAfter = detail?.retryAfter;
        const message = retryAfter
          ? `Rate limit exceeded. Please wait ${retryAfter} seconds.`
          : `Rate limit exceeded. Please try again later.`;

        toast({ title: "Too many requests", description: message });
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("rate-limit", handler as EventListener);
    return () =>
      window.removeEventListener("rate-limit", handler as EventListener);
  }, [toast]);

  return null;
}

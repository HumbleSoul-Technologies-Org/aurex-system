"use client";

import { useSettings } from "@/lib/settings-context";

export function useActiveCurrency() {
  const { settings } = useSettings();
  const payload = settings as any;

  const currencyCode =
    payload?.finance?.currency?.code ||
    payload?.tenantPortalSettings?.financeSettings?.currency ||
    payload?.financeSettings?.currency ||
    payload?.financeSettings_currency ||
    "USD";

  return String(currencyCode).toUpperCase();
}

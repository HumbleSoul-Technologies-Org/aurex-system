import { NextResponse } from "next/server";
import { formatCurrency, getExchangeRates } from "@/lib/currency";
import { getSystemSettings } from "@/lib/services/settings";

export async function GET() {
  const sys = getSystemSettings();
  const rates = getExchangeRates();
  const active = sys?.tenantPortalSettings?.financeSettings?.currency || "USD";

  const amount = 1000;

  const formatted = {
    active: formatCurrency(amount, active),
    USD: formatCurrency(amount, "USD"),
    EUR: formatCurrency(amount, "EUR"),
    KES: formatCurrency(amount, "KES"),
  };

  return NextResponse.json({
    activeCurrency: active,
    exchangeRates: rates,
    amount,
    formatted,
  });
}

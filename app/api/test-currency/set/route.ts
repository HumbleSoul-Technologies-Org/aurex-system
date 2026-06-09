import { NextResponse } from "next/server";
import { writeCollection, getCollection } from "@/lib/local-store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const currency = (url.searchParams.get("currency") || "USD").toUpperCase();

  const exchangeRatesParam = url.searchParams.get("rates");
  let rates = undefined;
  try {
    if (exchangeRatesParam) {
      rates = JSON.parse(exchangeRatesParam);
    }
  } catch (e) {
    // ignore
  }

  const existing = getCollection("system-settings");
  const obj = {
    id: "system-settings",
    version: "2.0.0",
    tenantPortalSettings: {
      financeSettings: {
        currency,
        exchangeRates: rates || { USD: 1, EUR: 0.92, GBP: 0.79, KES: 140 },
      },
    },
  };

  writeCollection("system-settings", [obj]);

  return NextResponse.json({ ok: true, set: obj });
}

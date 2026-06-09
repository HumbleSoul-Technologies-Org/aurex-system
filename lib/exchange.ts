import { updateTenantPortalSettings } from "@/lib/services/settings";

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "AUD",
  "CAD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "NZD",
  "SGD",
  "INR",
  "BRL",
  "MXN",
  "RUB",
  "KRW",
  "TRY",
  "AED",
  "SAR",
  "HKD",
  "PLN",
  "ILS",
  "CZK",
  "HUF",
  "CLP",
  "IDR",
  "VND",
  "MYR",
  "THB",
  "COP",
  "ARS",
  "KES",
  "NGN",
];

const REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 6; // 6 hours

export async function refreshExchangeRatesOnce(): Promise<Record<
  string,
  number
> | null> {
  try {
    const symbols = CURRENCIES.filter((c) => c !== "USD").join(",");
    const accessKey =
      process.env.EXCHANGERATE_HOST_KEY || process.env.EXCHANGE_API_KEY;
    let res = null as any;
    if (accessKey) {
      const url = `https://api.exchangerate.host/latest?base=USD&symbols=${encodeURIComponent(
        symbols,
      )}&access_key=${encodeURIComponent(accessKey)}`;
      res = await fetch(url);
    } else {
      // fallback to public ER API
      const url = `https://open.er-api.com/v6/latest/USD`;
      res = await fetch(url);
    }
    if (!res.ok) throw new Error(`Failed to fetch rates: ${res.status}`);
    const data = await res.json();
    const rates: Record<string, number> = { USD: 1 };
    // Handle structure differences between providers
    const sourceRates =
      data?.rates || data?.conversion_rates || data?.data?.rates || null;
    if (sourceRates) {
      for (const [k, v] of Object.entries(sourceRates)) {
        rates[k.toUpperCase()] = Number(v as any);
      }
    }

    // Persist into tenant portal settings (merge with existing financeSettings)
    try {
      // Lazy import to avoid circular dependencies at module-eval time
      const { getSystemSettings } = await import("@/lib/services/settings");
      const existing = getSystemSettings();
      const existingFinance =
        existing?.tenantPortalSettings?.financeSettings || {};
      updateTenantPortalSettings({
        financeSettings: {
          ...existingFinance,
          exchangeRates: rates,
        },
      });
    } catch (e) {
      console.warn("Failed to persist exchange rates to system settings", e);
    }

    return rates;
  } catch (error) {
    console.warn("refreshExchangeRatesOnce error", error);
    return null;
  }
}

let started = false;
export function startExchangeRefreshLoop() {
  if (started) return;
  started = true;

  // Run immediately
  void refreshExchangeRatesOnce();

  // Schedule interval
  setInterval(() => {
    void refreshExchangeRatesOnce();
  }, REFRESH_INTERVAL_MS);
}

import { getSystemSettings } from "@/lib/services/settings";

const currencyLocaleMap: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP",
  CNY: "zh-CN",
  AUD: "en-AU",
  CAD: "en-CA",
  CHF: "de-CH",
  SEK: "sv-SE",
  NOK: "nb-NO",
  DKK: "da-DK",
  NZD: "en-NZ",
  SGD: "en-SG",
  INR: "en-IN",
  BRL: "pt-BR",
  MXN: "es-MX",
  RUB: "ru-RU",
  KRW: "ko-KR",
  TRY: "tr-TR",
  AED: "ar-AE",
  SAR: "ar-SA",
  HKD: "zh-HK",
  PLN: "pl-PL",
  ILS: "he-IL",
  CZK: "cs-CZ",
  HUF: "hu-HU",
  CLP: "es-CL",
  IDR: "id-ID",
  VND: "vi-VN",
  MYR: "ms-MY",
  THB: "th-TH",
  COP: "es-CO",
  ARS: "es-AR",
  KES: "en-KE",
  NGN: "en-NG",
};

const currencySymbolAlias: Record<string, string> = {
  AUD: "A$",
  CAD: "CA$",
  NZD: "NZ$",
  SGD: "S$",
  HKD: "HK$",
};

export function getLocaleForCurrency(currencyCode: string = "USD") {
  const normalized = String(currencyCode || "USD").toUpperCase();
  return currencyLocaleMap[normalized] || "en-US";
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = "USD",
  locale?: string,
) {
  const numeric = Number(amount ?? 0);
  const code = String(currency || "USD").toUpperCase();
  const resolvedLocale = locale || getLocaleForCurrency(code);

  try {
    const formatter = new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency: code,
    });

    let formatted = formatter.format(numeric);
    const narrowSymbol = new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    })
      .format(0)
      .replace(/[0-9\s.,]/g, "");

    if (currencySymbolAlias[code] && narrowSymbol === "$") {
      if (formatted.startsWith("$")) {
        formatted = `${currencySymbolAlias[code]}${formatted.slice(1)}`;
      } else {
        formatted = formatted.replace("$", currencySymbolAlias[code]);
      }
    }

    return formatted;
  } catch (error) {
    console.warn("Currency formatting failed for", code, error);
    return `${code} ${numeric}`;
  }
}

export function getCurrencySymbol(currency: string = "USD", locale?: string) {
  const code = String(currency || "USD").toUpperCase();
  const resolvedLocale = locale || getLocaleForCurrency(code);

  try {
    const formatted = new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).format(0);

    const symbol = formatted.replace(/[0-9\s.,]/g, "") || code;
    if (symbol === "$" && currencySymbolAlias[code]) {
      return currencySymbolAlias[code];
    }
    return symbol;
  } catch (error) {
    console.warn("Currency symbol formatting failed for", code, error);
    return code;
  }
}

export function getActiveCurrency(): string {
  const settings = getSystemSettings();
  const currencyCode =
    settings?.tenantPortalSettings?.financeSettings?.currency ||
    (settings as any)?.finance?.currency?.code ||
    "USD";

  return String(currencyCode).toUpperCase();
}

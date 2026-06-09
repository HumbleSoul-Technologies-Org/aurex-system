import { NextResponse } from "next/server";
import { refreshExchangeRatesOnce } from "@/lib/exchange";

export async function GET() {
  const rates = await refreshExchangeRatesOnce();
  if (!rates) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, rates });
}

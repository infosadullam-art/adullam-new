export type Currency = "XOF" | "NGN" | "GHS" | "KES" | "ZAR" | "USD"

export const currencyByCountry: Record<string, Currency> = {
  CI: "XOF",
  SN: "XOF",
  BJ: "XOF",
  TG: "XOF",
  ML: "XOF",
  BF: "XOF",
  NE: "XOF",
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
}

export const currencyRates: Record<Currency, number> = {
  USD: 1,
  XOF: 600,
  NGN: 1500,
  GHS: 12,
  KES: 160,
  ZAR: 18,
}

export function convertFromUSD(amount: number, currency: Currency) {
  return amount * currencyRates[currency]
}

export function formatCurrency(amount: number, currency: Currency, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

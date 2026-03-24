"use client"

import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"

export function CurrencyIndicator() {
  const { getCurrencySymbol, getCurrentRate, currency } = useCurrencyFormatter()
  
  return (
    <div className="text-xs text-muted-foreground text-right mb-2 px-4">
      💱 Taux: 1 USD = {getCurrentRate().toFixed(2)} {getCurrencySymbol()} ({currency})
    </div>
  )
}
"use client"

// Ancien point d'entrée conservé pour ne pas modifier les imports existants
// (`@/hooks/useCurrency`). Tout passe désormais par l'unique hook
// hooks/useCurrencyFormatter.ts : mêmes taux, mêmes symboles, même formatage partout.
export { useCurrencyFormatter } from "./useCurrencyFormatter"
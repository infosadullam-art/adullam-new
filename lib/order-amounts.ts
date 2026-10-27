// lib/order-amounts.ts
// Les anciennes commandes (avant le passage en dollars, juin 2026) ont leur total en FCFA.
// Toutes les autres sont en USD. Cette fonction renvoie toujours un montant en USD.
const LEGACY_CUTOFF = Date.UTC(2026, 5, 1)
const LEGACY_XOF_RATE = 615.5

export function orderUsd(
  order: { createdAt?: string | Date | null } | null | undefined,
  value: number | null | undefined,
): number {
  const n = Number(value ?? 0)
  if (!order?.createdAt) return n
  const t = new Date(order.createdAt).getTime()
  return Number.isFinite(t) && t < LEGACY_CUTOFF ? n / LEGACY_XOF_RATE : n
}

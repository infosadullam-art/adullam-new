// lib/admin/format.ts — formats et libellés communs de l'admin (français, FCFA)

export function formatUSD(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }).format(n)
}

export function formatNombre(value: number | null | undefined): string {
  return new Intl.NumberFormat("fr-FR").format(Number(value ?? 0)).replace(/ | /g, " ")
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

export function formatDateHeure(value: string | Date | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export type Ton = "rouge" | "ambre" | "vert" | "bleu" | "gris"

export const STATUT_COMMANDE: Record<string, { label: string; ton: Ton }> = {
  PENDING: { label: "En attente", ton: "ambre" },
  CONFIRMED: { label: "Confirmée", ton: "bleu" },
  PROCESSING: { label: "En préparation", ton: "bleu" },
  SHIPPED: { label: "Expédiée", ton: "bleu" },
  IN_TRANSIT: { label: "En transit", ton: "bleu" },
  OUT_FOR_DELIVERY: { label: "En livraison", ton: "bleu" },
  DELIVERED: { label: "Livrée", ton: "vert" },
  CANCELLED: { label: "Annulée", ton: "gris" },
  REFUNDED: { label: "Remboursée", ton: "rouge" },
}

export const STATUT_PAIEMENT: Record<string, { label: string; ton: Ton }> = {
  PENDING: { label: "À payer", ton: "ambre" },
  PAID: { label: "Payée", ton: "vert" },
  FAILED: { label: "Échec", ton: "rouge" },
  REFUNDED: { label: "Remboursée", ton: "rouge" },
}

export const STATUT_PRODUIT: Record<string, string> = {
  ACTIVE: "Actifs",
  DRAFT: "Brouillons",
  OUT_OF_STOCK: "En rupture",
  ARCHIVED: "Archivés",
}

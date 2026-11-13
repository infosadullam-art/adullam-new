// lib/consent.ts
// Vrai seulement si le visiteur a clique sur "Accepter" dans le bandeau (components/consent-banner.tsx).
export function hasMetaConsent(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem("adullam_consent") === "granted"
  } catch {
    return false
  }
}

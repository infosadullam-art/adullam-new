// Mesures du site : memes compteurs anonymes que l'app (colonne "Site" de /admin/dashboard/app).
// Aucune donnee personnelle et aucun identifiant d'installation : seulement le nom de l'action, avec la plateforme "web".
// Les actions fortes (ajout au panier...) partent aussi vers /api/track pour le moteur de recommandation (ALS).
export type SiteEvent =
  | "signup" | "login" | "search" | "product_view" | "add_to_cart"
  | "checkout_start" | "order" | "adu_message" | "quote_request"

const API = "https://api.adullamarket.com"

export function trackSite(...events: SiteEvent[]): void {
  if (typeof window === "undefined" || events.length === 0) return
  if (process.env.NODE_ENV !== "production") return
  try {
    fetch(`${API}/api/app/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ platform: "web", version: "site", events }),
    }).catch(() => {})
  } catch { /* les mesures ne doivent jamais gener l'utilisateur */ }
}

// Passe par le fetcher du site (apiFetch) pour que l'action soit rattachee au compte quand le client est connecte.
export function trackSiteInteraction(
  fetcher: (path: string, init?: any) => Promise<any>,
  type: "ADD_TO_CART",
  productId: string,
): void {
  if (typeof window === "undefined" || !productId) return
  try {
    const sessionId = localStorage.getItem("adullam_session_id")
    if (!sessionId) return
    Promise.resolve(
      fetcher("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          productId,
          type,
          context: "PRODUCT_PAGE",
          sessionId,
          country: (document.cookie.match(/(?:^|; )nx_country=([A-Za-z]{2})/) || [])[1],
        }),
      }),
    ).catch(() => {})
  } catch { /* silencieux */ }
}
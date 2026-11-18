// Message simple quand le reseau est coupe (au lieu de "Failed to fetch" / "Load failed" du navigateur)
const NET_MSG: Record<string, string> = {
  fr: "Connexion impossible. Vérifiez votre connexion internet et réessayez.",
  en: "Can't connect. Check your internet connection and try again.",
  pt: "Sem ligação. Verifique a sua ligação à internet e tente novamente.",
  ar: "تعذّر الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.",
}

const NETWORK_RE = /failed to fetch|load failed|networkerror|network request failed|fetch failed/i

export function friendlyError(err: unknown, fallback?: string): string {
  const message = String((err as any)?.message ?? "")
  if (NETWORK_RE.test(message)) {
    const lang = (typeof document !== "undefined" ? document.documentElement.lang : "") || "fr"
    return NET_MSG[lang.slice(0, 2).toLowerCase()] || NET_MSG.fr
  }
  return message || fallback || ""
}
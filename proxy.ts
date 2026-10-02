// proxy.ts (racine du projet, à côté de package.json — Next.js 16 : ex-middleware.ts)
//
// Détecte le pays du visiteur UNE fois (géoloc Vercel) et pose deux cookies :
//   nx_country : code pays (ex "NG")
//   nx_locale  : langue UI (fr | en | ar | pt)
//
// Règle : on ne touche JAMAIS à un cookie valide déjà présent, ce qui protège
// le choix manuel fait via setCountry() dans LocaleProvider.
// Les cookies ne sont pas httpOnly : LocaleProvider les lit côté client.

import { NextResponse, type NextRequest } from "next/server"
import { geolocation } from "@vercel/functions"
import {
  AUTO_COOKIE_MAX_AGE,
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  LOCALE_COOKIE,
  isUiLanguage,
  normalizeCountry,
  resolveCountry,
} from "@/lib/country-config"

const cookieOptions = {
  path: "/",
  maxAge: AUTO_COOKIE_MAX_AGE,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: false,
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const existingCountry = normalizeCountry(request.cookies.get(COUNTRY_COOKIE)?.value)
  const hasLocale = isUiLanguage(request.cookies.get(LOCALE_COOKIE)?.value)

  // Tout est déjà en place : rien à faire (cas de 99 % des requêtes).
  if (existingCountry && hasLocale) return response

  // Pays : cookie existant valide > géoloc Vercel > pays par défaut.
  // En local (next dev) il n'y a pas d'en-tête de géoloc → repli sur DEFAULT_COUNTRY.
  const country =
    existingCountry ?? normalizeCountry(geolocation(request).country) ?? DEFAULT_COUNTRY

  const resolved = resolveCountry(country)

  if (!existingCountry) {
    response.cookies.set(COUNTRY_COOKIE, resolved.country, cookieOptions)
  }
  if (!hasLocale) {
    response.cookies.set(LOCALE_COOKIE, resolved.language, cookieOptions)
  }

  return response
}

export const config = {
  // Pages uniquement : on exclut l'API (réécrite vers le VPS), les assets Next,
  // le tunnel Sentry (/monitoring) et tout chemin contenant un point (fichiers statiques).
  matcher: ["/((?!api|_next|monitoring|.*\\..*).*)"],
}

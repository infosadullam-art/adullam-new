// proxy.ts (racine du projet, à côté de package.json — Next.js 16 : ex-middleware.ts)
//
// Détecte le pays du visiteur UNE fois (géoloc Vercel) et pose deux cookies :
//   nx_country : code pays (ex "NG")
//   nx_locale  : langue UI (fr | en | ar | pt)
//
// Règle : on ne touche JAMAIS à un cookie valide déjà présent, ce qui protège
// les choix manuels (setCountry / setLanguage dans LocaleProvider).
// Les cookies ne sont pas httpOnly : LocaleProvider et lib/api.ts les lisent côté client.
//
// Première visite : on injecte aussi les cookies dans les en-têtes de la requête en cours,
// pour que le rendu serveur (next-intl, <html lang dir>) voie déjà la bonne langue
// au lieu d'attendre la visite suivante.

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
  const existingCountry = normalizeCountry(request.cookies.get(COUNTRY_COOKIE)?.value)
  const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const hasLocale = isUiLanguage(existingLocale)

  // Tout est déjà en place : rien à faire (cas de 99 % des requêtes).
  if (existingCountry && hasLocale) return NextResponse.next()

  // Pays : cookie existant valide > géoloc Vercel > pays par défaut.
  // En local (next dev) il n'y a pas d'en-tête de géoloc → repli sur DEFAULT_COUNTRY.
  const country =
    existingCountry ?? normalizeCountry(geolocation(request).country) ?? DEFAULT_COUNTRY

  const resolved = resolveCountry(country)
  const countryValue = existingCountry ?? resolved.country
  const localeValue = hasLocale ? existingLocale : resolved.language

  // Cookies de la requête en cours : on garde les autres tels quels (valeurs brutes)
  // et on ajoute les nôtres.
  const kept = (request.headers.get("cookie") ?? "")
    .split(/;\s*/)
    .filter(
      (c) => c && !c.startsWith(`${COUNTRY_COOKIE}=`) && !c.startsWith(`${LOCALE_COOKIE}=`)
    )
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(
    "cookie",
    [...kept, `${COUNTRY_COOKIE}=${countryValue}`, `${LOCALE_COOKIE}=${localeValue}`].join("; ")
  )

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (!existingCountry) response.cookies.set(COUNTRY_COOKIE, countryValue, cookieOptions)
  if (!hasLocale) response.cookies.set(LOCALE_COOKIE, localeValue, cookieOptions)

  return response
}

export const config = {
  // Pages uniquement : on exclut l'API (réécrite vers le VPS), les assets Next,
  // le tunnel Sentry (/monitoring) et tout chemin contenant un point (fichiers statiques).
  matcher: ["/((?!api|_next|monitoring|.*\\..*).*)"],
}
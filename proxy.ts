// proxy.ts (racine du projet, à côté de package.json — Next.js 16 : ex-middleware.ts)
//
// Devise et langue DYNAMIQUES : à chaque visite, le pays est détecté par la géolocalisation
// Vercel et deux cookies sont tenus à jour :
//   nx_country : code pays (ex "NG")           -> devise, livraison
//   nx_locale  : langue UI (fr | en | ar | pt)  -> interface, traductions API
//
// Règle d'or : un choix MANUEL du visiteur (marqueurs nx_country_src / nx_locale_src = "manual",
// posés par setCountry / setLanguage) n'est JAMAIS écrasé. Sans choix manuel, le pays suit la
// géolocalisation de la visite en cours (voyage, VPN...), et la langue suit le pays.
//
// Les cookies ne sont pas httpOnly : LocaleProvider et lib/api.ts les lisent côté client.
// On les injecte aussi dans les en-têtes de la requête en cours, pour que le rendu serveur
// (next-intl, <html lang dir>) voie déjà la bonne langue dès la première visite.

import { NextResponse, type NextRequest } from "next/server"
import { geolocation } from "@vercel/functions"
import {
  AUTO_COOKIE_MAX_AGE,
  COUNTRY_COOKIE,
  COUNTRY_SOURCE_COOKIE,
  DEFAULT_COUNTRY,
  LOCALE_COOKIE,
  LOCALE_SOURCE_COOKIE,
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
  const cookieCountry = normalizeCountry(request.cookies.get(COUNTRY_COOKIE)?.value)
  const rawLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const cookieLocale = isUiLanguage(rawLocale) ? rawLocale : null

  const countryIsManual =
    !!cookieCountry && request.cookies.get(COUNTRY_SOURCE_COOKIE)?.value === "manual"
  const localeIsManual =
    !!cookieLocale && request.cookies.get(LOCALE_SOURCE_COOKIE)?.value === "manual"

  // Pays : choix manuel > géolocalisation de CETTE visite > ancien cookie > pays par défaut.
  // (En local, `next dev` n'a pas d'en-tête de géoloc : on garde le cookie ou le défaut.)
  const country = countryIsManual
    ? cookieCountry!
    : (normalizeCountry(geolocation(request).country) ?? cookieCountry ?? DEFAULT_COUNTRY)

  // Langue : choix manuel > langue du pays.
  const language = localeIsManual ? cookieLocale! : resolveCountry(country).language

  const countryChanged = country !== cookieCountry
  const languageChanged = language !== cookieLocale

  // Rien à mettre à jour (cas de la plupart des requêtes) : on ne touche à rien.
  if (!countryChanged && !languageChanged) return NextResponse.next()

  // Cookies de la requête en cours : les autres restent tels quels (valeurs brutes).
  const kept = (request.headers.get("cookie") ?? "")
    .split(/;\s*/)
    .filter((c) => c && !c.startsWith(`${COUNTRY_COOKIE}=`) && !c.startsWith(`${LOCALE_COOKIE}=`))
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("cookie", [...kept, `${COUNTRY_COOKIE}=${country}`, `${LOCALE_COOKIE}=${language}`].join("; "))

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (countryChanged) response.cookies.set(COUNTRY_COOKIE, country, cookieOptions)
  if (languageChanged) response.cookies.set(LOCALE_COOKIE, language, cookieOptions)

  return response
}

export const config = {
  // Pages uniquement : on exclut l'API (réécrite vers le VPS), les assets Next,
  // le tunnel Sentry (/monitoring) et tout chemin contenant un point (fichiers statiques).
  matcher: ["/((?!api|_next|monitoring|.*\\..*).*)"],
}
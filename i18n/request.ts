// i18n/request.ts
//
// Configuration next-intl "sans routing" : la langue vient du cookie nx_locale
// (posé par proxy.ts, modifiable par LanguageSelector), jamais de l'URL.
// Les 35 routes françaises existantes ne bougent donc pas.

import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import {
  COUNTRY_COOKIE,
  LOCALE_COOKIE,
  isUiLanguage,
  resolveCountry,
  type UiLanguage,
} from "@/lib/country-config"

type Messages = { [key: string]: string | Messages }

// Les clés absentes d'une langue retombent sur le français (jamais de clé brute à l'écran).
function merge(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base }
  for (const [key, value] of Object.entries(override)) {
    const current = result[key]
    result[key] =
      typeof value === "object" && typeof current === "object"
        ? merge(current, value)
        : value
  }
  return result
}

export default getRequestConfig(async () => {
  const store = await cookies()
  const fromCookie = store.get(LOCALE_COOKIE)?.value

  // Langue : cookie valide > langue dérivée du pays > langue du pays par défaut.
  const locale: UiLanguage = isUiLanguage(fromCookie)
    ? fromCookie
    : resolveCountry(store.get(COUNTRY_COOKIE)?.value).language

  const base = (await import("../messages/fr.json")).default as Messages
  const localized =
    locale === "fr"
      ? base
      : ((await import(`../messages/${locale}.json`)).default as Messages)

  return { locale, messages: merge(base, localized) }
})

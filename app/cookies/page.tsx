import { getTranslations } from "next-intl/server"

export default async function CookiesPage() {
  const t = await getTranslations("pageCookies")
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("whatTitle")}</h2>
          <p>{t("whatText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("usedTitle")}</h2>
          <ul className="list-disc list-inside mt-2">
            <li>{t("used1")}</li>
            <li>{t("used2")}</li>
            <li>{t("used3")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("manageTitle")}</h2>
          <p>{t("manageText")}</p>
        </section>
      </div>
    </div>
  )
}
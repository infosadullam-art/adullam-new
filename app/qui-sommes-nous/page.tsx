import { getTranslations } from "next-intl/server"

export default async function QuiSommesNousPage() {
  const t = await getTranslations("pageAbout")
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("missionTitle")}</h2>
          <p>{t("missionText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("historyTitle")}</h2>
          <p>{t("historyText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("valuesTitle")}</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>{t("v1")}</li>
            <li>{t("v2")}</li>
            <li>{t("v3")}</li>
            <li>{t("v4")}</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{t("globalTitle")}</h2>
          <p>{t("globalText")}</p>
          <p className="text-sm text-gray-500 mt-2">{t("quote")}</p>
        </section>
      </div>
    </div>
  )
}
import { getTranslations } from "next-intl/server"

export default async function RetoursPage() {
  const t = await getTranslations("pageRetours")
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("withdrawTitle")}</h2>
          <p>{t("withdrawText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("eligTitle")}</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>{t("e1")}</li>
            <li>{t("e2")}</li>
            <li>{t("e3")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("howTitle")}</h2>
          <p>{t("h1")}</p>
          <p>{t("h2")}</p>
          <p>{t("h3")}</p>
          <p>{t("h4")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("defectTitle")}</h2>
          <p>{t("defectText")}</p>
        </section>
      </div>
    </div>
  )
}
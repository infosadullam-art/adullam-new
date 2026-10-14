import { getTranslations } from "next-intl/server"

export default async function ConfidentialitePage() {
  const t = await getTranslations("pageConfidentialite")
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <p className="mb-4">{t("updated")}</p>

      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("s1Title")}</h2>
          <p>{t("s1Text")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("s2Title")}</h2>
          <p>{t("s2Text")}</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>{t("l1")}</li>
            <li>{t("l2")}</li>
            <li>{t("l3")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("s3Title")}</h2>
          <p>{t("s3Text")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("s4Title")}</h2>
          <p>{t("s4Text")}</p>
        </section>
      </div>
    </div>
  )
}
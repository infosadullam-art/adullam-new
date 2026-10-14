import { getTranslations } from "next-intl/server"

export default async function PressePage() {
  const t = await getTranslations("pagePresse")
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("mediaTitle")}</h2>
          <p>{t("mediaText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("articlesTitle")}</h2>
          <ul className="space-y-2">
            <li>{t("soon")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("releasesTitle")}</h2>
          <ul className="space-y-2">
            <li>{t("soon")}</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{t("contactTitle")}</h2>
          <p>{t.rich("contactText", { b: (chunks) => <strong><bdi>{chunks}</bdi></strong> })}</p>
          <p className="mt-2">{t("phoneLabel")} <bdi>+225 05 64 74 91 51</bdi></p>
        </section>
      </div>
    </div>
  )
}
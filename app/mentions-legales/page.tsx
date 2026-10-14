import { getTranslations } from "next-intl/server"

export default async function MentionsLegalesPage() {
  const t = await getTranslations("pageMentions")
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("editorTitle")}</h2>
          <p><strong>Adullam Global</strong>{t("companyStatus")}</p>
          <p>{t("emailLabel")} <bdi>contact@adullamarket.com</bdi></p>
          <p>{t("phoneLabel")} <bdi>+225 05 64 74 91 51</bdi></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("hostTitle")}</h2>
          <p>Vercel Inc.</p>
          <p>440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
        </section>

        <section className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-yellow-800">{t("tempTitle")}</h2>
          <p className="text-yellow-700">
            {t("tempText")}
          </p>
        </section>
      </div>
    </div>
  )
}
import { getTranslations } from "next-intl/server"

export default async function AidePage() {
  const t = await getTranslations("pageAide")
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("q1")}</h2>
          <p>{t("s1")}</p>
          <p>{t("s2")}</p>
          <p>{t("s3")}</p>
          <p>{t("s4")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("q2")}</h2>
          <p><strong>{t("seaName")}</strong>{t("seaInfo")}</p>
          <p><strong>{t("airName")}</strong>{t("airInfo")}</p>
          <p><strong>{t("expressName")}</strong>{t("expressInfo")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("q3")}</h2>
          <p>{t("a3")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("q4")}</h2>
          <p>
            {t.rich("a4", {
              link: (chunks) => <a href="/contact" className="text-[#2B4F3C] underline">{chunks}</a>,
            })}
          </p>
        </section>
      </div>
    </div>
  )
}
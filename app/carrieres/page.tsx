import { getTranslations } from "next-intl/server"

export default async function CarrieresPage() {
  const t = await getTranslations("pageCarrieres")
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("joinTitle")}</h2>
          <p>{t("joinText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t("openTitle")}</h2>
          <ul className="space-y-3">
            <li className="border-b pb-2">
              <h3 className="font-semibold">{t("job1")}</h3>
              <p className="text-sm text-gray-600">{t("job1Meta")}</p>
            </li>
            <li className="border-b pb-2">
              <h3 className="font-semibold">{t("job2")}</h3>
              <p className="text-sm text-gray-600">{t("job2Meta")}</p>
            </li>
            <li className="border-b pb-2">
              <h3 className="font-semibold">{t("job3")}</h3>
              <p className="text-sm text-gray-600">{t("job3Meta")}</p>
            </li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{t("spontTitle")}</h2>
          <p>{t.rich("spontText", { b: (chunks) => <strong><bdi>{chunks}</bdi></strong> })}</p>
        </section>
      </div>
    </div>
  )
}
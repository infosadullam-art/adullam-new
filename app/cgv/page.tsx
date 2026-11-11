import { getTranslations } from "next-intl/server"
import { LegalPage, type LegalSection } from "@/components/legal-page"

export async function generateMetadata() {
  const t = await getTranslations("pageCgv")
  return { title: String(t.raw("title")) }
}

export default async function Page() {
  const t = await getTranslations("pageCgv")
  return (
    <LegalPage
      title={String(t.raw("title"))}
      updated={String(t.raw("updated"))}
      intro={String(t.raw("intro"))}
      tocLabel={String(t.raw("toc"))}
      numbered
      sections={t.raw("sections") as LegalSection[]}
    />
  )
}

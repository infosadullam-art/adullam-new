import { getTranslations } from "next-intl/server"
import { LegalPage, type LegalSection } from "@/components/legal-page"

export async function generateMetadata() {
  const t = await getTranslations("pageAbout")
  return { title: String(t.raw("title")) }
}

export default async function Page() {
  const t = await getTranslations("pageAbout")
  return (
    <LegalPage
      title={String(t.raw("title"))}
      intro={String(t.raw("intro"))}
      sections={t.raw("sections") as LegalSection[]}
    />
  )
}

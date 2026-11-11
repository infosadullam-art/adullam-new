import { getTranslations } from "next-intl/server"
import { LegalPage, type LegalSection } from "@/components/legal-page"

export async function generateMetadata() {
  const t = await getTranslations("pageMentions")
  return { title: String(t.raw("title")) }
}

export default async function Page() {
  const t = await getTranslations("pageMentions")
  return (
    <LegalPage
      title={String(t.raw("title"))}
      updated={String(t.raw("updated"))}
      numbered
      sections={t.raw("sections") as LegalSection[]}
    />
  )
}

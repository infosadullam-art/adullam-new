import { getMessages } from "next-intl/server"
import { LegalPage, type LegalDoc } from "@/components/legal-page"

async function getDoc(): Promise<LegalDoc> {
  const messages = (await getMessages()) as Record<string, any>
  return messages["pageCookies"] as LegalDoc
}

export async function generateMetadata() {
  const doc = await getDoc()
  return { title: String(doc?.title || "") }
}

export default async function Page() {
  const doc = await getDoc()
  return <LegalPage doc={doc} numbered />
}

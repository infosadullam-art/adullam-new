"use client"

import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import MobileNav from "@/components/mobile-nav"

export type LegalSection = { title: string; paragraphs?: string[]; items?: string[] }

type Props = {
  title: string
  updated?: string
  intro?: string
  tocLabel?: string
  numbered?: boolean
  sections: LegalSection[]
}

// Mini-format des textes : **gras**, [texte](/lien), et l'adresse e-mail de contact cliquable.
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\((\/[^)\s]*)\)|(contact@adullamarket\.com)/g
const linkCls = "underline underline-offset-2 decoration-border hover:decoration-foreground hover:text-foreground transition-colors"

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  let m: RegExpExecArray | null
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1]) out.push(<strong key={k++} className="font-semibold text-foreground">{m[1]}</strong>)
    else if (m[2]) out.push(<a key={k++} href={m[3]} className={linkCls}>{m[2]}</a>)
    else out.push(<a key={k++} href="mailto:contact@adullamarket.com" className={linkCls}><bdi>contact@adullamarket.com</bdi></a>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function LegalPage({ title, updated, intro, tocLabel, numbered, sections }: Props) {
  const showToc = !!tocLabel && sections.length > 4
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="max-w-3xl mx-auto px-4 py-10 lg:py-14 pb-24 lg:pb-14">
        <header className="mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
          {updated && <p className="mt-2 text-sm text-muted-foreground">{updated}</p>}
          {intro && <p className="mt-4 text-base leading-7 text-muted-foreground">{inline(intro)}</p>}
        </header>

        {showToc && (
          <nav aria-label={tocLabel} className="mb-8 rounded-md border border-border bg-card p-4">
            <p className="text-sm font-semibold mb-2">{tocLabel}</p>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
              {sections.map((s, i) => (
                <li key={i}>
                  <a href={`#s${i + 1}`} className="hover:text-foreground transition-colors">
                    {numbered ? `${i + 1}. ` : ""}{s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div>
          {sections.map((s, i) => (
            <section key={i} id={`s${i + 1}`} className="py-6 border-b border-border last:border-b-0 scroll-mt-24">
              <h2 className="text-lg font-semibold mb-3">{numbered ? `${i + 1}. ` : ""}{s.title}</h2>
              {s.paragraphs?.map((p, j) => (
                <p key={j} className="text-[15px] leading-7 text-muted-foreground mb-3 last:mb-0">{inline(p)}</p>
              ))}
              {s.items && (
                <ul className="list-disc pl-5 rtl:pl-0 rtl:pr-5 space-y-1.5 text-[15px] leading-7 text-muted-foreground marker:text-border">
                  {s.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  )
}

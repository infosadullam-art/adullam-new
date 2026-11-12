"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import MobileNav from "@/components/mobile-nav"

type Block =
  | { t: "p"; x: string }
  | { t: "ul"; i: string[] }
  | { t: "ol"; i: string[] }
  | { t: "tb"; h: string[]; r: string[][] }
  | { t: "co"; x: string; title?: string }
  | { t: "btn"; x: string }

export type LegalDoc = {
  title: string
  updated?: string
  intro?: string
  summaryTitle?: string
  summary?: string[]
  toc?: string
  print?: string
  sections: { title: string; blocks: Block[] }[]
}

const ACCENT = "#D4372B"

// next-intl peut renvoyer les listes sous forme d'objet {"0": ..., "1": ...} : on remet de vrais tableaux partout.
function norm<T>(x: any): T {
  if (Array.isArray(x)) return x.map((v) => norm(v)) as any
  if (x && typeof x === "object") {
    const keys = Object.keys(x)
    if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
      return keys.sort((a, b) => Number(a) - Number(b)).map((k) => norm(x[k])) as any
    }
    const o: any = {}
    for (const k of keys) o[k] = norm(x[k])
    return o
  }
  return x
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

function Check() {
  return (
    <svg className="mt-1 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5l3.5 3.5L16 5.5" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.t === "p") {
          return <p key={i} className="text-[15px] leading-7 text-muted-foreground">{inline(b.x)}</p>
        }
        if (b.t === "ul") {
          return (
            <ul key={i} className="space-y-2">
              {b.i.map((it, j) => (
                <li key={j} className="flex gap-3 text-[15px] leading-7 text-muted-foreground">
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-[1px]" style={{ background: ACCENT }} />
                  <span>{inline(it)}</span>
                </li>
              ))}
            </ul>
          )
        }
        if (b.t === "ol") {
          return (
            <ol key={i} className="space-y-3">
              {b.i.map((it, j) => (
                <li key={j} className="flex gap-3 text-[15px] leading-7 text-muted-foreground">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold tabular-nums text-foreground">{j + 1}</span>
                  <span>{inline(it)}</span>
                </li>
              ))}
            </ol>
          )
        }
        if (b.t === "tb") {
          return (
            <div key={i} className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="bg-black/[0.03] dark:bg-white/[0.05]">
                    {b.h.map((h, j) => (
                      <th key={j} className="border-b border-border px-3 py-2.5 text-left rtl:text-right text-xs font-semibold uppercase tracking-wide text-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.r.map((row, j) => (
                    <tr key={j} className="border-b border-border last:border-b-0">
                      {row.map((c, k) => (
                        <td key={k} className={`px-3 py-2.5 align-top leading-6 ${k === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{inline(c)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        if (b.t === "co") {
          return (
            <div key={i} className="rounded-md border border-border border-l-4 rtl:border-l rtl:border-r-4 bg-card p-4" style={{ borderLeftColor: ACCENT }}>
              {b.title && <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>{b.title}</p>}
              <p className="text-[15px] leading-7 text-foreground">{inline(b.x)}</p>
            </div>
          )
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => { try { window.dispatchEvent(new Event("adullam:consent-open")) } catch { /* ignore */ } }}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card print:hidden"
          >
            {b.x}
          </button>
        )
      })}
    </div>
  )
}

export function LegalPage({ doc, numbered }: { doc: LegalDoc; numbered?: boolean }) {
  const d = norm<LegalDoc>(doc)
  const sections = d.sections || []
  const [active, setActive] = useState("s1")

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const els = sections.map((_, i) => document.getElementById(`s${i + 1}`)).filter(Boolean) as HTMLElement[]
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: 0 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections.length])

  const showToc = !!d.toc && sections.length > 3
  const label = (i: number, t: string) => (numbered ? `${i + 1}. ${t}` : t)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden lg:block print:hidden"><Header /></div>
      <div className="lg:hidden print:hidden"><MobileHeader /></div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>Adullam Global</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-4xl">{d.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {d.updated && <p className="text-sm text-muted-foreground">{d.updated}</p>}
            {d.print && (
              <button
                type="button"
                onClick={() => { try { window.print() } catch { /* ignore */ } }}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background print:hidden"
              >
                {d.print}
              </button>
            )}
          </div>
          {d.intro && <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">{inline(d.intro)}</p>}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 pb-24 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14 lg:pb-14">
        {showToc && (
          <aside className="mb-8 lg:mb-0 print:hidden">
            <details className="rounded-md border border-border bg-card p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold">{d.toc}</summary>
              <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {sections.map((s, i) => (
                  <li key={i}><a href={`#s${i + 1}`} className="hover:text-foreground">{label(i, s.title)}</a></li>
                ))}
              </ol>
            </details>
            <nav aria-label={d.toc} className="sticky top-24 hidden lg:block">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">{d.toc}</p>
              <ol className="space-y-0.5 border-l rtl:border-l-0 rtl:border-r border-border text-sm">
                {sections.map((s, i) => {
                  const on = active === `s${i + 1}`
                  return (
                    <li key={i}>
                      <a
                        href={`#s${i + 1}`}
                        className={`-ml-px rtl:-ml-0 rtl:-mr-px block border-l-2 rtl:border-l-0 rtl:border-r-2 py-1.5 pl-3 rtl:pl-0 rtl:pr-3 leading-5 transition-colors ${on ? "font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                        style={on ? { borderColor: ACCENT } : undefined}
                      >
                        {label(i, s.title)}
                      </a>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </aside>
        )}

        <div className={showToc ? "" : "mx-auto max-w-3xl lg:col-span-2"}>
          {d.summary && d.summary.length > 0 && (
            <div className="mb-10 rounded-md border border-border border-l-4 rtl:border-l rtl:border-r-4 bg-card p-5" style={{ borderLeftColor: ACCENT }}>
              <p className="mb-3 text-sm font-semibold text-foreground">{d.summaryTitle}</p>
              <ul className="space-y-2.5">
                {d.summary.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-7 text-foreground"><Check /><span>{inline(s)}</span></li>
                ))}
              </ul>
            </div>
          )}

          {sections.map((s, i) => (
            <section key={i} id={`s${i + 1}`} className="scroll-mt-24 border-b border-border py-8 first:pt-0 last:border-b-0">
              <h2 className="mb-4 flex items-start gap-3 text-xl font-semibold tracking-tight">
                {numbered && (
                  <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded border border-border px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
                )}
                <span>{s.title}</span>
              </h2>
              <Blocks blocks={s.blocks || []} />
            </section>
          ))}
        </div>
      </main>

      <div className="print:hidden"><Footer /></div>
      <div className="lg:hidden print:hidden"><MobileNav /></div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

const KEY = "adullam_consent"
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID
const ACCENT = "#D4372B"

type Choice = "granted" | "denied"

function read(): Choice | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === "granted" || v === "denied" ? v : null
  } catch {
    return null
  }
}

function write(v: Choice) {
  try { localStorage.setItem(KEY, v) } catch { /* stockage indisponible : le choix vaut pour cette visite */ }
}

// Charge la bibliotheque Meta uniquement apres accord. Les evenements envoyes avant l'accord sont abandonnes.
function loadPixel() {
  const w = window as any
  if (!PIXEL || w.__adullamPixelLoaded) return
  w.__adullamPixelLoaded = true
  try {
    if (!w.fbq) {
      const n: any = (w.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) })
      if (!w._fbq) w._fbq = n
      n.push = n
      n.loaded = true
      n.version = "2.0"
      n.queue = []
    }
    w.fbq.queue = []
    w.fbq("init", PIXEL)
    w.fbq("track", "PageView")
    const s = document.createElement("script")
    s.async = true
    s.src = "https://connect.facebook.net/en_US/fbevents.js"
    document.head.appendChild(s)
  } catch { /* on ne bloque jamais le site pour la publicite */ }
}

export default function ConsentBanner() {
  const t = useTranslations("consent")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const c = read()
    if (c === "granted") loadPixel()
    if (c === null) setOpen(true)
    const onOpen = () => setOpen(true)
    window.addEventListener("adullam:consent-open", onOpen)
    return () => window.removeEventListener("adullam:consent-open", onOpen)
  }, [])

  const choose = (v: Choice) => {
    const had = (window as any).__adullamPixelLoaded
    write(v)
    setOpen(false)
    if (v === "granted") loadPixel()
    else if (had) window.location.reload()
  }

  if (!open) return null

  return (
    <div role="dialog" aria-live="polite" className="fixed inset-x-0 bottom-20 z-[60] px-3 lg:bottom-4 print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-6 text-foreground">
          {t("text")}{" "}
          <a href="/cookies" className="underline underline-offset-2 hover:opacity-80">{t("more")}</a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose("denied")} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background">
            {t("refuse")}
          </button>
          <button type="button" onClick={() => choose("granted")} className="rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: ACCENT }}>
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  )
}

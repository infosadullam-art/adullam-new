"use client"

import React, { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

interface Props {
  apiBase: string
  onResults: (products: any[], labels?: { sent: string; found: string; none: string }) => void
}

const MAX_SIDE = 800

function charger(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("illisible")) }
    img.src = url
  })
}

function reduire(img: HTMLImageElement): Promise<Blob> {
  const k = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
  const c = document.createElement("canvas")
  c.width = Math.max(1, Math.round(img.width * k))
  c.height = Math.max(1, Math.round(img.height * k))
  const ctx = c.getContext("2d")
  if (!ctx) return Promise.reject(new Error("canvas"))
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(img, 0, 0, c.width, c.height)
  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("conversion"))), "image/jpeg", 0.85)
  })
}

class Garde extends React.Component<{ children: React.ReactNode }, { erreur: boolean }> {
  state = { erreur: false }
  static getDerivedStateFromError() { return { erreur: true } }
  componentDidCatch(e: unknown) { console.error("ChatPhotoButton:", e) }
  render() { return this.state.erreur ? null : this.props.children }
}

function Bouton({ apiBase, onResults }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [actif, setActif] = useState(false)
  const [busy, setBusy] = useState(false)
  const [erreur, setErreur] = useState("")
  const t = useTranslations("photoSearch")

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("photochat")
      if (q === "1") localStorage.setItem("photochat", "1")
      if (q === "0") localStorage.removeItem("photochat")
      setActif(localStorage.getItem("photochat") !== "0")
    } catch {
      setActif(true)
    }
  }, [])

  const afficherErreur = (msg: string) => {
    setErreur(msg)
    setTimeout(() => setErreur(""), 4500)
  }

  const onFichier = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setBusy(true)
    try {
      const blob = await reduire(await charger(file))
      const form = new FormData()
      form.append("image", blob, "photo.jpg")
      form.append("limit", "24")
      const res = await fetch(`${apiBase}/api/search/image`, { method: "POST", body: form })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        afficherErreur(res.status === 429 ? t("tooMany") : t("unavailable"))
        return
      }
      onResults(data.data || [], { sent: t("chatSent"), found: t("chatFound"), none: t("chatNone") })
    } catch {
      afficherErreur(t("unreadable"))
    } finally {
      setBusy(false)
    }
  }

  if (!actif) return null

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={t("button")}
        title={t("button")}
        style={{
          width: "34px", height: "34px", borderRadius: "50%", background: "var(--surface)",
          border: "none", cursor: busy ? "default" : "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
          color: "var(--ink-2)", opacity: busy ? 0.5 : 1,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFichier} />
      {erreur && (
        <div role="alert" style={{
          position: "fixed", left: "50%", bottom: "90px", transform: "translateX(-50%)", zIndex: 10000,
          background: "#111", color: "#fff", padding: "8px 14px", borderRadius: "8px", fontSize: "13px",
        }}>
          {erreur}
        </div>
      )}
    </>
  )
}

export function ChatPhotoButton(props: Props) {
  return (
    <Garde>
      <Bouton {...props} />
    </Garde>
  )
}

export default ChatPhotoButton
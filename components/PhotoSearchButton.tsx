"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Camera, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"

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

function dessiner(img: HTMLImageElement, maxSide: number): HTMLCanvasElement {
  const k = Math.min(1, maxSide / Math.max(img.width, img.height))
  const c = document.createElement("canvas")
  c.width = Math.max(1, Math.round(img.width * k))
  c.height = Math.max(1, Math.round(img.height * k))
  const ctx = c.getContext("2d")
  if (!ctx) throw new Error("canvas")
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(img, 0, 0, c.width, c.height)
  return c
}

function versBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("conversion"))), "image/jpeg", 0.85)
  })
}

interface PhotoSearchButtonProps {
  className?: string
  /** Si fourni : on appelle cette fonction avec les produits au lieu d'ouvrir /search */
  onResults?: (products: any[], thumb: string) => void
}

export function PhotoSearchButton({ className = "", onResults }: PhotoSearchButtonProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [erreur, setErreur] = useState("")
  const t = useTranslations("photoSearch")

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
      const img = await charger(file)
      const blob = await versBlob(dessiner(img, MAX_SIDE))
      const thumb = dessiner(img, 96).toDataURL("image/jpeg", 0.7)

      const form = new FormData()
      form.append("image", blob, "photo.jpg")
      form.append("limit", "24")
      const res = await apiFetch("/api/search/image", { method: "POST", body: form })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        afficherErreur(res.status === 429 ? t("tooMany") : t("unavailable"))
        return
      }
      if (onResults) {
        onResults(data.data, thumb)
      } else {
        try {
          (window as any).__photoSearch = { products: data.data, thumb, ts: Date.now() }; sessionStorage.setItem("photoSearch", JSON.stringify({ products: data.data, thumb, ts: Date.now() }))
        } catch {}
        if (window.location.pathname === "/photo") { window.dispatchEvent(new Event("photo-search-updated")) } else { router.push("/photo") }
      }
    } catch {
      afficherErreur(t("unreadable"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={t("button")}
        title={t("button")}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-black/5 transition-colors disabled:opacity-60 ${className}`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFichier} />
      {erreur && (
        <div role="alert" className="fixed left-1/2 top-24 z-[200] -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {erreur}
        </div>
      )}
    </>
  )
}

export default PhotoSearchButton
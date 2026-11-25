"use client"

import { useEffect } from "react"

// Reprise automatique des images Alibaba qui echouent (reponse invalide au premier acces, reseau lent) :
// meme adresse apres 0,8 s, puis image d'origine, puis origine apres 2,5 s, puis image de remplacement.
const ALI = /(^|\/\/)(s|sc04)\.alicdn\.com\//i
const WAIT = [800, 1200, 2500, 0]

function original(url: string): string {
  const m = /^(?:https?:)?\/\/s\.alicdn\.com\/@sc04\/kf\/(.+?\.(?:jpe?g|png|webp|gif))(?:_\d+x\d+(?:q\d+)?\.(?:jpe?g|png|webp|avif))?$/i.exec(url)
  return m ? `https://sc04.alicdn.com/kf/${m[1]}` : url
}

export function ImageRetry() {
  useEffect(() => {
    const onError = (e: Event) => {
      const el = e.target
      if (!(el instanceof HTMLImageElement)) return
      const url = el.currentSrc || el.src
      if (!url || !ALI.test(url)) return
      const n = Number(el.dataset.aduRetry || "0")
      if (n >= WAIT.length) return
      el.dataset.aduRetry = String(n + 1)
      window.setTimeout(() => {
        el.removeAttribute("srcset")
        el.src = n === 3 ? "/placeholder.svg" : n >= 1 ? original(url) : url
      }, WAIT[n])
    }
    document.addEventListener("error", onError, true)
    return () => document.removeEventListener("error", onError, true)
  }, [])
  return null
}

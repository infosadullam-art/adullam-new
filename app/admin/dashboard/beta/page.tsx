"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dashboardApi } from "@/lib/admin/api-client"
import { RefreshCw } from "lucide-react"

type Status = "PENDING" | "APPROVED" | "REJECTED"
type Tester = { id: string; name: string; email: string; phone?: string | null; platform: string; device?: string | null; country?: string | null; status: Status; createdAt: string }

const STATUS_LABEL: Record<Status, string> = { PENDING: "En attente", APPROVED: "Approuvé", REJECTED: "Refusé" }
const STATUS_CLASS: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-neutral-200 text-neutral-700",
}
const PLATFORM_LABEL: Record<string, string> = { ANDROID: "Android", IOS: "iPhone" }
const nf = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n))

const LINK_KEY = "beta_install_link"
const TPL_KEY = "beta_invite_template"
const SENT_KEY = "beta_invited_ids"
const AUTO_KEY = "beta_auto_email"
const DEFAULT_LINK = "https://expo.dev/accounts/adullam-global/projects/adullam/builds/54c93f44-ccd0-473b-8a13-bb2927c0f686"
const DEFAULT_SUBJECT = "Votre accès bêta Adullamarket"
const DEFAULT_TEMPLATE = `Bonjour {prenom},

Merci de votre inscription au programme bêta d'Adullamarket ! Votre place est confirmée.

Pour installer l'application sur votre téléphone Android :
1. Ouvrez ce lien depuis votre téléphone : {lien}
2. Touchez « Install » (Installer) et autorisez l'installation si Android le demande.
3. Ouvrez Adullam et créez votre compte.

Pendant 21 jours, utilisez l'application comme un vrai client : recherche de produits, recherche par photo, panier, commande, demande de devis, assistant Adu.

Si vous rencontrez un problème, répondez simplement à ce message avec une capture d'écran et une courte description.

L'application mesure son usage de façon anonyme (aucune donnée personnelle) pour nous aider à l'améliorer.

Merci pour votre aide !
L'équipe Adullamarket`

function readLS(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function writeLS(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* stockage indisponible : on continue sans */ }
}

export default function BetaAdminPage() {
  const [items, setItems] = useState<Tester[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState<"ALL" | Status>("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState("")
  const [link, setLink] = useState(DEFAULT_LINK)
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [invited, setInvited] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState("")
  const [autoEmail, setAutoEmail] = useState(true)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    const l = readLS(LINK_KEY); if (l) setLink(l)
    const t = readLS(TPL_KEY); if (t) setTemplate(t)
    if (readLS(AUTO_KEY) === "0") setAutoEmail(false)
    try { const s = readLS(SENT_KEY); if (s) setInvited(new Set(JSON.parse(s) as string[])) } catch { /* ignore */ }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [list, st] = await Promise.all([dashboardApi.getBetaList(), dashboardApi.getAppStats(30)])
      if (list.success) setItems(list.data as Tester[])
      else setError("Impossible de charger la liste.")
      if (st.success) setStats(st.data)
    } catch {
      setError("Impossible de charger la liste.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const change = async (t: Tester, status: Status) => {
    setBusyId(t.id)
    setError("")
    setNotice("")
    try {
      const sendInvite = status === "APPROVED" && t.status !== "APPROVED" && t.platform === "ANDROID" && autoEmail && linkOk
      const res = await dashboardApi.setBetaStatus(t.id, status, sendInvite ? { link: link.trim(), message: template } : undefined)
      if (res.success) {
        setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, status } : x)))
        if (sendInvite) {
          if (res.email === "sent") {
            markInvited(t.id)
            setNotice("E-mail d'invitation envoyé à " + t.email + ".")
          } else {
            setError("Testeur approuvé, mais l'e-mail n'a pas pu partir : utilisez WhatsApp ou le bouton E-mail.")
          }
        }
      } else setError("La modification a échoué.")
    } catch {
      setError("La modification a échoué.")
    } finally {
      setBusyId("")
    }
  }

  const linkOk = /^https:\/\//i.test(link.trim())
  const message = (t: Tester) =>
    template.split("{prenom}").join((t.name || "").trim().split(/\s+/)[0] || "").split("{lien}").join(link.trim())
  const markInvited = (id: string) => {
    setInvited((prev) => {
      const next = new Set(prev); next.add(id)
      writeLS(SENT_KEY, JSON.stringify(Array.from(next)))
      return next
    })
  }
  const copy = async (t: Tester) => {
    try { await navigator.clipboard.writeText(message(t)); setCopiedId(t.id); setTimeout(() => setCopiedId(""), 1800); markInvited(t.id) } catch { setError("Copie impossible : sélectionnez le message à la main.") }
  }

  const limits: Record<string, number> = stats?.beta?.limits ?? { ANDROID: 30, IOS: 10 }
  const used = (p: string) => items.filter((t) => t.platform === p && t.status !== "REJECTED").length
  const visits = Number(stats?.beta?.visits ?? 0)
  const total = items.length
  const rate = visits > 0 ? Math.min(100, (total / visits) * 100) : null
  const counts = useMemo(() => ({
    ALL: items.length,
    PENDING: items.filter((t) => t.status === "PENDING").length,
    APPROVED: items.filter((t) => t.status === "APPROVED").length,
    REJECTED: items.filter((t) => t.status === "REJECTED").length,
  }), [items])
  const shown = filter === "ALL" ? items : items.filter((t) => t.status === filter)

  if (loading && items.length === 0 && !stats) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-light">Programme bêta</h1>
          <p className="text-sm text-muted-foreground">Validez les inscrits, puis envoyez-leur l'invitation avec le lien d'installation.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} aria-label="Rafraîchir">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>}
      {notice && <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800" role="status">{notice}</p>}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {(["ANDROID", "IOS"] as const).map((p) => (
          <Card key={p}>
            <CardContent className="pt-6">
              <p className="text-3xl font-light">{used(p)} <span className="text-base text-muted-foreground">/ {limits[p] ?? 0}</span></p>
              <p className="mt-1 text-xs text-muted-foreground">Places {PLATFORM_LABEL[p]}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-light">{nf(visits)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Visites de la page /beta</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-light">{rate === null ? "–" : `${rate.toFixed(0)} %`}</p>
            <p className="mt-1 text-xs text-muted-foreground">Inscrits / visites ({nf(total)} inscrits)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Invitation Android</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="beta-link" className="mb-1 block text-sm font-medium">Lien d'installation actuel</label>
            <Input id="beta-link" value={link} onChange={(e) => { setLink(e.target.value); writeLS(LINK_KEY, e.target.value) }} placeholder="https://expo.dev/…" />
            <p className="mt-1 text-xs text-muted-foreground">À mettre à jour après chaque nouveau build de l'app. {linkOk ? "" : "Le lien doit commencer par https://"}</p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={autoEmail}
              onChange={(e) => { setAutoEmail(e.target.checked); writeLS(AUTO_KEY, e.target.checked ? "1" : "0") }}
            />
            <span>Envoyer l'e-mail d'invitation automatiquement quand j'approuve un testeur Android (depuis contact@adullamarket.com, à l'adresse indiquée à l'inscription).</span>
          </label>
          <div>
            <label htmlFor="beta-template" className="mb-1 block text-sm font-medium">Message (modifiable)</label>
            <textarea
              id="beta-template"
              value={template}
              onChange={(e) => { setTemplate(e.target.value); writeLS(TPL_KEY, e.target.value) }}
              rows={12}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">{"{prenom}"} et {"{lien}"} sont remplacés automatiquement. Vous gardez la main : WhatsApp et la messagerie s'ouvrent avec le message prêt, et c'est vous qui appuyez sur « Envoyer ».</p>
            <Button variant="ghost" size="sm" className="mt-1" onClick={() => { setTemplate(DEFAULT_TEMPLATE); writeLS(TPL_KEY, DEFAULT_TEMPLATE) }}>Rétablir le message d'origine</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inscrits</CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
                {f === "ALL" ? "Tous" : STATUS_LABEL[f]} ({counts[f]})
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun inscrit dans cette catégorie.</p>
          ) : (
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Nom</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                  <th className="px-3 py-2 font-medium">Appareil</th>
                  <th className="px-3 py-2 font-medium">Inscrit le</th>
                  <th className="px-3 py-2 font-medium">Statut</th>
                  <th className="py-2 pl-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => {
                  const digits = (t.phone || "").replace(/\D/g, "")
                  const busy = busyId === t.id
                  const canInvite = t.status === "APPROVED" && t.platform === "ANDROID" && linkOk
                  const wa = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message(t))}` : ""
                  const mail = `mailto:${t.email}?subject=${encodeURIComponent(DEFAULT_SUBJECT)}&body=${encodeURIComponent(message(t))}`
                  return (
                    <tr key={t.id} className="border-b align-top last:border-0">
                      <td className="py-2 pr-3"><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.country || ""}</p></td>
                      <td className="px-3 py-2">
                        <p className="break-all">{t.email}</p>
                        {digits && <p className="text-xs text-muted-foreground">WhatsApp {t.phone}</p>}
                      </td>
                      <td className="px-3 py-2"><p>{PLATFORM_LABEL[t.platform] ?? t.platform}</p><p className="text-xs text-muted-foreground">{t.device || ""}</p></td>
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(t.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block rounded-[3px] px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[t.status] ?? ""}`}>{STATUS_LABEL[t.status] ?? t.status}</span>
                        {invited.has(t.id) && <p className="mt-1 text-xs text-green-700">Invitation envoyée</p>}
                      </td>
                      <td className="py-2 pl-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          {t.status !== "APPROVED" && <Button size="sm" disabled={busy} onClick={() => change(t, "APPROVED")}>Approuver</Button>}
                          {t.status !== "REJECTED" && <Button size="sm" variant="outline" disabled={busy} onClick={() => change(t, "REJECTED")}>Refuser</Button>}
                          {t.status !== "PENDING" && <Button size="sm" variant="ghost" disabled={busy} onClick={() => change(t, "PENDING")}>Remettre</Button>}
                        </div>
                        {t.status === "APPROVED" && t.platform === "IOS" && (
                          <p className="mt-2 text-right text-xs text-muted-foreground">iPhone : version pas encore disponible</p>
                        )}
                        {canInvite && (
                          <div className="mt-2 flex flex-wrap justify-end gap-2">
                            {wa && (
                              <Button asChild size="sm" variant="outline">
                                <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => markInvited(t.id)}>WhatsApp</a>
                              </Button>
                            )}
                            <Button asChild size="sm" variant="outline">
                              <a href={mail} onClick={() => markInvited(t.id)}>E-mail</a>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => copy(t)}>{copiedId === t.id ? "Copié" : "Copier"}</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Pour WhatsApp, le numéro doit contenir l'indicatif du pays (ex. +237…).</p>
        </CardContent>
      </Card>
    </div>
  )
}

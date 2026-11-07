"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { RefreshCw } from "lucide-react"

const EVENT_LABEL: Record<string, string> = {
  open: "Ouvertures de l'app",
  signup: "Inscriptions",
  login: "Connexions",
  search: "Recherches",
  photo_search: "Recherches par photo",
  product_view: "Fiches produit vues",
  add_to_cart: "Ajouts au panier",
  checkout_start: "Paiements démarrés",
  order: "Commandes",
  adu_message: "Messages à Adu",
  quote_request: "Demandes de devis",
  beta_visit: "Visites de la page bêta",
}
const ORDER = Object.keys(EVENT_LABEL)
const PLATFORM_LABEL: Record<string, string> = { android: "Android", ios: "iPhone", web: "Site" }
const PERIODS = [7, 30, 90]
const nf = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n))

export default function AppStatsPage() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await dashboardApi.getAppStats(days)
      if (res.success) setData(res.data)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { load() }, [load])

  if (loading && !data) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const active = data?.active ?? {}
  const daily: { day: string; n: number }[] = data?.dailyActive ?? []
  const maxDaily = Math.max(1, ...daily.map((d) => Number(d.n) || 0))
  const platforms: { platform: string; n: number }[] = data?.platforms ?? []
  const maxPlat = Math.max(1, ...platforms.map((p) => Number(p.n) || 0))
  const versions: { version: string; n: number }[] = data?.versions ?? []
  const maxVer = Math.max(1, ...versions.map((v) => Number(v.n) || 0))
  const events: { event: string; platform: string; n: number }[] = data?.events ?? []
  const cell = (ev: string, pf: string) => Number(events.find((e) => e.event === ev && e.platform === pf)?.n ?? 0)
  const aduMessages = events.filter((e) => e.event === "adu_message").reduce((s, e) => s + Number(e.n || 0), 0)
  const empty = Number(active.mau ?? 0) === 0

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-light">Application mobile</h1>
          <p className="text-sm text-muted-foreground">Mesures anonymes : aucun nom, e-mail ou compte n'est enregistré.</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <Button key={p} size="sm" variant={days === p ? "default" : "outline"} onClick={() => setDays(p)}>{p} j</Button>
          ))}
          <Button variant="outline" size="sm" onClick={load} aria-label="Rafraîchir">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">Impossible de charger les statistiques. Réessayez.</p>}
      {empty && !error && (
        <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
          Aucun appareil mesuré pour l'instant. Les chiffres apparaissent dès que les testeurs utilisent la version de l'app qui envoie ces mesures.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Actifs aujourd'hui", v: active.dau },
          { label: "Actifs sur 7 jours", v: active.wau },
          { label: "Actifs sur 30 jours", v: active.mau },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-6">
              <p className="text-3xl font-light">{nf(Number(k.v ?? 0))}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Appareils actifs par jour ({days} derniers jours)</CardTitle></CardHeader>
        <CardContent>
          {daily.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pas encore de données.</p>
          ) : (
            <div className="flex h-32 items-end gap-1" role="img" aria-label="Appareils actifs par jour">
              {daily.map((d) => (
                <div key={d.day} className="flex-1 rounded-t-[2px] bg-[var(--adm-rouge)]" style={{ height: `${Math.max(4, (Number(d.n) / maxDaily) * 100)}%` }} title={`${d.day} : ${d.n}`} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Plateformes (30 jours)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {platforms.length === 0 && <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
            {platforms.map((p) => (
              <div key={p.platform}>
                <div className="mb-1 flex justify-between text-sm"><span>{PLATFORM_LABEL[p.platform] ?? p.platform}</span><span className="font-medium">{nf(Number(p.n))}</span></div>
                <div className="h-2 rounded-[2px] bg-muted"><div className="h-2 rounded-[2px] bg-[var(--adm-rouge)]" style={{ width: `${(Number(p.n) / maxPlat) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Versions de l'app (7 jours)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {versions.length === 0 && <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
            {versions.map((v) => (
              <div key={v.version}>
                <div className="mb-1 flex justify-between text-sm"><span>{v.version === "-" ? "Inconnue" : v.version}</span><span className="font-medium">{nf(Number(v.n))}</span></div>
                <div className="h-2 rounded-[2px] bg-muted"><div className="h-2 rounded-[2px] bg-[var(--adm-rouge)]" style={{ width: `${(Number(v.n) / maxVer) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Actions ({days} jours)</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Action</th>
                <th className="px-3 py-2 text-right font-medium">Android</th>
                <th className="px-3 py-2 text-right font-medium">iPhone</th>
                <th className="px-3 py-2 text-right font-medium">Site</th>
                <th className="py-2 pl-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {ORDER.map((ev) => {
                const a = cell(ev, "android"), i = cell(ev, "ios"), w = cell(ev, "web")
                return (
                  <tr key={ev} className="border-b last:border-0">
                    <td className="py-2 pr-3">{EVENT_LABEL[ev]}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{nf(a)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{nf(i)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{nf(w)}</td>
                    <td className="py-2 pl-3 text-right font-medium tabular-nums">{nf(a + i + w)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Adu (assistant)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-light">{nf(aduMessages)}</p><p className="text-xs text-muted-foreground">Messages depuis l'app</p></div>
            <div><p className="text-2xl font-light">{nf(Number(data?.adu?.n ?? 0))}</p><p className="text-xs text-muted-foreground">Avis reçus</p></div>
            <div><p className="text-2xl font-light">{data?.adu?.avg ? Number(data.adu.avg).toFixed(1) : "–"}</p><p className="text-xs text-muted-foreground">Note moyenne</p></div>
          </div>
          <p className="mt-4 text-sm"><Link href="/admin/dashboard/chat-feedback" className="underline underline-offset-2">Voir les avis sur Adu</Link> · <Link href="/admin/dashboard/ia" className="underline underline-offset-2">Voir les stats des IA</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}

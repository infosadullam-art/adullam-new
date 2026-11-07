"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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

export default function BetaAdminPage() {
  const [items, setItems] = useState<Tester[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState<"ALL" | Status>("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState("")

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
    try {
      const res = await dashboardApi.setBetaStatus(t.id, status)
      if (res.success) setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, status } : x)))
      else setError("La modification a échoué.")
    } catch {
      setError("La modification a échoué.")
    } finally {
      setBusyId("")
    }
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
          <p className="text-sm text-muted-foreground">Validez les inscrits, puis envoyez-leur le lien d'installation.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} aria-label="Rafraîchir">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>}

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
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Nom</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                  <th className="px-3 py-2 font-medium">Appareil</th>
                  <th className="px-3 py-2 font-medium">Inscrit le</th>
                  <th className="px-3 py-2 font-medium">Statut</th>
                  <th className="py-2 pl-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => {
                  const digits = (t.phone || "").replace(/\D/g, "")
                  const busy = busyId === t.id
                  return (
                    <tr key={t.id} className="border-b align-top last:border-0">
                      <td className="py-2 pr-3"><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.country || ""}</p></td>
                      <td className="px-3 py-2">
                        <p className="break-all">{t.email}</p>
                        {digits && <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-2">WhatsApp {t.phone}</a>}
                      </td>
                      <td className="px-3 py-2"><p>{PLATFORM_LABEL[t.platform] ?? t.platform}</p><p className="text-xs text-muted-foreground">{t.device || ""}</p></td>
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(t.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-3 py-2"><span className={`inline-block rounded-[3px] px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[t.status] ?? ""}`}>{STATUS_LABEL[t.status] ?? t.status}</span></td>
                      <td className="py-2 pl-3">
                        <div className="flex justify-end gap-2">
                          {t.status !== "APPROVED" && <Button size="sm" disabled={busy} onClick={() => change(t, "APPROVED")}>Approuver</Button>}
                          {t.status !== "REJECTED" && <Button size="sm" variant="outline" disabled={busy} onClick={() => change(t, "REJECTED")}>Refuser</Button>}
                          {t.status !== "PENDING" && <Button size="sm" variant="ghost" disabled={busy} onClick={() => change(t, "PENDING")}>Remettre</Button>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

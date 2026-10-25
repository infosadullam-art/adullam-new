"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, RefreshCw, TriangleAlert } from "lucide-react"
import { AdminHeader } from "@/components/admin/header"
import { Stamp } from "@/components/admin/stamp"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { overviewApi } from "@/lib/admin/api-client"
import {
  formatFCFA,
  formatNombre,
  formatDate,
  formatDateHeure,
  STATUT_COMMANDE,
  STATUT_PAIEMENT,
  STATUT_PRODUIT,
} from "@/lib/admin/format"

const base = "/admin/dashboard"

interface Overview {
  currency: string
  revenue: { paidTotal: number; paidOrders: number; paid30d: number; paidOrders30d: number }
  orders: {
    total: number
    awaitingPayment: number
    byStatus: Record<string, number>
    recent: Array<{
      id: string
      orderNumber: string
      total: number
      status: string
      paymentStatus: string
      createdAt: string
      user?: { name?: string | null; email?: string | null } | null
    }>
  }
  users: { total: number; new7d: number }
  sourcing: { pending: number }
  coupons: { active: number; uses: number; discountGiven: number }
  products: { byStatus: Record<string, number> }
  daily: Array<{ date: string; orders: number; revenue: number }>
}

const ORDRE_STATUTS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]
const COULEUR_TON: Record<string, string> = {
  ambre: "var(--adm-ambre)",
  bleu: "var(--adm-bleu)",
  vert: "var(--adm-vert)",
  gris: "#a7aea9",
  rouge: "var(--adm-rouge)",
}

function Carte({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-[var(--adm-trait)] bg-[var(--adm-papier)] ${className}`}>{children}</section>
  )
}

function ATraiter({ d }: { d: Overview }) {
  const lignes = [
    {
      n: d.orders.awaitingPayment,
      texte: d.orders.awaitingPayment > 1 ? "commandes attendent leur paiement" : "commande attend son paiement",
      href: `${base}/orders`,
    },
    {
      n: d.sourcing.pending,
      texte: d.sourcing.pending > 1 ? "demandes de sourcing sans réponse" : "demande de sourcing sans réponse",
      href: `${base}/sourcing/pending`,
    },
    {
      n: d.products.byStatus?.DRAFT ?? 0,
      texte: (d.products.byStatus?.DRAFT ?? 0) > 1 ? "produits en brouillon" : "produit en brouillon",
      href: `${base}/products`,
    },
  ].filter((l) => l.n > 0)

  return (
    <section className="adm-encre rounded-lg p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">À traiter</h2>
      {lignes.length === 0 ? (
        <p className="mt-3 text-[#b9c0bb]">Tout est à jour. Rien n'attend votre action.</p>
      ) : (
        <ul className="mt-2 divide-y divide-white/10">
          {lignes.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group flex items-center gap-4 py-3.5">
                <span className="adm-display w-16 shrink-0 text-right text-[40px] font-bold leading-none text-[var(--adm-ambre)] sm:w-20 sm:text-5xl">
                  {l.n}
                </span>
                <span className="flex-1 text-[15px] text-[#e4e7e3]">{l.texte}</span>
                <ArrowRight className="h-5 w-5 shrink-0 text-[#8b948f] transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Encaisse({ d }: { d: Overview }) {
  const max = useMemo(() => Math.max(0, ...d.daily.map((j) => j.revenue)), [d.daily])
  const premier = d.daily[0]?.date
  const dernier = d.daily[d.daily.length - 1]?.date
  return (
    <Carte className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Encaissé</h2>
      <div className="mt-3 grid gap-5 sm:grid-cols-[auto_1fr] sm:gap-8">
        <div>
          <p className="adm-display text-[40px] font-bold leading-none sm:text-5xl">{formatFCFA(d.revenue.paidTotal)}</p>
          <p className="mt-2 text-sm text-[var(--adm-gris)]">
            sur {formatNombre(d.revenue.paidOrders)} {d.revenue.paidOrders > 1 ? "commandes payées" : "commande payée"}, depuis le début
          </p>
          <div className="adm-perf mt-4 pt-3 text-sm">
            <p>
              <span className="font-semibold">{formatFCFA(d.revenue.paid30d)}</span>
              <span className="text-[var(--adm-gris)]"> sur les 30 derniers jours</span>
            </p>
            {d.revenue.paid30d === 0 && (
              <p className="mt-1 text-[var(--adm-rouge)]">Aucun paiement reçu sur cette période.</p>
            )}
          </div>
        </div>

        <div className="min-w-0 self-end">
          <div
            className="flex h-28 items-end gap-[3px] border-b border-[var(--adm-trait)]"
            role="img"
            aria-label={`Encaissements par jour sur 30 jours, maximum ${formatFCFA(max)}`}
          >
            {d.daily.map((j, i) => {
              const h = max > 0 ? Math.max(3, Math.round((j.revenue / max) * 100)) : 3
              return (
                <div
                  key={j.date}
                  className="adm-barre flex-1 rounded-t-[2px]"
                  style={{
                    height: `${h}%`,
                    background: j.revenue > 0 ? "var(--adm-rouge)" : "var(--adm-trait)",
                    animationDelay: `${i * 12}ms`,
                  }}
                  title={`${formatDate(j.date)} : ${formatFCFA(j.revenue)} · ${j.orders} commande${j.orders > 1 ? "s" : ""}`}
                />
              )
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-[var(--adm-gris)]">
            <span>{formatDate(premier)}</span>
            <span>{formatDate(dernier)}</span>
          </div>
        </div>
      </div>
    </Carte>
  )
}

function Parcours({ d }: { d: Overview }) {
  const total = d.orders.total || 1
  const presents = ORDRE_STATUTS.filter((s) => (d.orders.byStatus?.[s] ?? 0) > 0)
  return (
    <Carte className="p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Commandes par étape</h2>
        <span className="text-sm text-[var(--adm-gris)]">{formatNombre(d.orders.total)} au total</span>
      </div>
      <div className="mt-4 flex h-4 w-full gap-[2px] overflow-hidden rounded-[3px]" role="img" aria-label="Répartition des commandes par étape">
        {presents.map((s) => (
          <div
            key={s}
            style={{
              width: `${((d.orders.byStatus[s] ?? 0) / total) * 100}%`,
              minWidth: 6,
              background: COULEUR_TON[STATUT_COMMANDE[s]?.ton ?? "gris"],
            }}
            title={`${STATUT_COMMANDE[s]?.label ?? s} : ${d.orders.byStatus[s]}`}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {presents.map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ background: COULEUR_TON[STATUT_COMMANDE[s]?.ton ?? "gris"] }}
              aria-hidden
            />
            <span className="truncate text-[var(--adm-gris)]">{STATUT_COMMANDE[s]?.label ?? s}</span>
            <span className="ml-auto font-semibold">{d.orders.byStatus[s]}</span>
          </li>
        ))}
      </ul>
    </Carte>
  )
}

function Dernieres({ d }: { d: Overview }) {
  return (
    <Carte>
      <div className="flex items-center justify-between px-5 pt-5 sm:px-6">
        <h2 className="text-lg font-semibold">Dernières commandes</h2>
        <Link href={`${base}/orders`} className="text-sm font-medium text-[var(--adm-rouge)] hover:underline">
          Tout voir
        </Link>
      </div>
      {d.orders.recent.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[var(--adm-gris)] sm:px-6">Aucune commande pour le moment.</p>
      ) : (
        <ul className="mt-2 divide-y divide-dashed divide-[var(--adm-trait)] pb-2">
          {d.orders.recent.map((o) => {
            const st = STATUT_COMMANDE[o.status] ?? { label: o.status, ton: "gris" as const }
            const pay = STATUT_PAIEMENT[o.paymentStatus] ?? { label: o.paymentStatus, ton: "gris" as const }
            return (
              <li key={o.id}>
                <Link
                  href={`${base}/orders/${o.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-black/[0.03] sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{o.orderNumber}</p>
                    <p className="truncate text-sm text-[var(--adm-gris)]">
                      {o.user?.name || o.user?.email || "Client"} · {formatDateHeure(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="adm-display font-bold">{formatFCFA(o.total)}</span>
                    <span className="flex gap-1">
                      <Stamp ton={st.ton}>{st.label}</Stamp>
                      <Stamp ton={pay.ton}>{pay.label}</Stamp>
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Carte>
  )
}

function Chiffre({ label, valeur, note, href }: { label: string; valeur: string; note?: string; href?: string }) {
  const inner = (
    <>
      <p className="text-sm text-[var(--adm-gris)]">{label}</p>
      <p className="adm-display mt-1 text-[30px] font-bold leading-none">{valeur}</p>
      {note && <p className="mt-2 text-xs text-[var(--adm-gris)]">{note}</p>}
    </>
  )
  const cls = "block rounded-lg border border-[var(--adm-trait)] bg-[var(--adm-papier)] p-4"
  return href ? (
    <Link href={href} className={`${cls} hover:border-[var(--adm-encre)]`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

function Chargement() {
  return (
    <div className="space-y-4 p-4 sm:p-6" aria-busy="true" aria-label="Chargement">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const [data, setData] = useState<Overview | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [chargement, setChargement] = useState(true)

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      const res = await overviewApi.get()
      if (res.success && res.data) setData(res.data as Overview)
      else setErreur(res.error || "Le serveur n'a pas renvoyé de données.")
    } catch {
      setErreur("Impossible de joindre le serveur.")
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    charger()
  }, [charger])

  return (
    <div>
      <AdminHeader
        title="Accueil"
        description="L'état réel de la boutique, en FCFA"
        actions={
          <Button variant="outline" size="sm" onClick={charger} disabled={chargement}>
            <RefreshCw className={`mr-2 h-4 w-4 ${chargement ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        }
      />

      {chargement && !data ? (
        <Chargement />
      ) : erreur || !data ? (
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 rounded-lg border border-[var(--adm-rouge)] bg-[#d4372b0f] p-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--adm-rouge)]" />
            <div>
              <p className="font-semibold">Les chiffres ne se sont pas chargés</p>
              <p className="mt-1 text-sm text-[var(--adm-gris)]">{erreur} Vérifiez votre connexion, puis réessayez.</p>
              <Button size="sm" className="mt-3" onClick={charger}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <ATraiter d={data} />
            <Encaisse d={data} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Parcours d={data} />
            <Dernieres d={data} />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Chiffre
              label="Clients"
              valeur={formatNombre(data.users.total)}
              note={data.users.new7d > 0 ? `${data.users.new7d} nouveaux cette semaine` : "Aucun nouveau cette semaine"}
              href={`${base}/users`}
            />
            <Chiffre
              label="Produits actifs"
              valeur={formatNombre(data.products.byStatus?.ACTIVE ?? 0)}
              note={Object.entries(data.products.byStatus ?? {})
                .filter(([k, v]) => k !== "ACTIVE" && v > 0)
                .map(([k, v]) => `${v} ${(STATUT_PRODUIT[k] ?? k).toLowerCase()}`)
                .join(" · ") || undefined}
              href={`${base}/products`}
            />
            <Chiffre
              label="Coupons actifs"
              valeur={formatNombre(data.coupons.active)}
              note={
                data.coupons.uses > 0
                  ? `${data.coupons.uses} utilisations, ${formatFCFA(data.coupons.discountGiven)} offerts`
                  : "Aucune utilisation"
              }
            />
            <Chiffre
              label="Panier moyen payé"
              valeur={data.revenue.paidOrders > 0 ? formatFCFA(Math.round(data.revenue.paidTotal / data.revenue.paidOrders)) : "—"}
              note={data.revenue.paidOrders > 0 ? `sur ${data.revenue.paidOrders} commandes payées` : "Aucune commande payée"}
            />
          </div>
        </div>
      )}
    </div>
  )
}

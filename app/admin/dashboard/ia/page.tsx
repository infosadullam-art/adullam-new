"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw, TriangleAlert, Info } from "lucide-react"
import { AdminHeader } from "@/components/admin/header"
import { Stamp } from "@/components/admin/stamp"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { iaApi } from "@/lib/admin/api-client"
import { formatNombre, formatDateHeure } from "@/lib/admin/format"

interface IA {
  generatedAt: string
  alerts: Array<{ level: "critical" | "warning" | "info"; message: string }>
  services: {
    als: { up: boolean; ms: number | null; trained: boolean | null; users: number | null; products: number | null; factors: number | null }
    realtime: { up: boolean; ms: number | null }
    database: { up: boolean; ms: number | null }
  }
  system: { load1: number | null; cpus: number; memoryUsedPct: number | null; processUptimeH: number | null }
  interactions: {
    views: number
    clicks: number
    carts: number
    wishlist: number
    purchases: number
    chat: number
    ctr: number | null
    cartRate: number | null
    purchaseRate: number | null
    lastAt: string | null
  }
  contexts: Array<{ context: string; views: number; clicks: number; carts: number; purchases: number; ctr: number | null }>
  visitors: {
    anonymous: { views: number; clicks: number; carts: number; purchases: number; ctr: number | null }
    known: { views: number; clicks: number; carts: number; purchases: number; ctr: number | null }
  }
  daily: Array<{ date: string; views: number; clicks: number }>
  catalog: { seen: number; active: number; coveragePct: number | null }
  scroll: {
    avgDepth: number | null
    maxDepth: number | null
    measured: number
    sessions: number
    sessionsWithClick: number
    avgProductsViewed: number | null
    maxProductsViewed: number
    avgViewSeconds: number | null
  }
  coldStart: { anonymousProfiles: number; anonymousNew7d: number; converted: number; conversionPct: number | null }
  forYou: { scores: number; users: number; products: number; expired: number; lastCalculatedAt: string | null; feedScores: number }
  chat: {
    feedbacks: number
    avgRating: number | null
    rated: number
    recommendYes: number
    recommendAnswered: number
    sentiments: Array<{ sentiment: string; count: number }>
  }
}

const CONTEXTES: Record<string, string> = { FOR_YOU: "Pour vous", PRODUCT_PAGE: "Page produit", CHATBOT: "Adu (chatbot)" }
const SENTIMENTS: Record<string, string> = { positive: "Positif", neutral: "Neutre", negative: "Négatif", inconnu: "Non indiqué" }

const pct = (v: number | null) => (v === null ? "—" : `${String(v).replace(".", ",")} %`)

function Bloc({ titre, note, children, className = "" }: { titre: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-[var(--adm-trait)] bg-[var(--adm-papier)] p-5 ${className}`}>
      <h2 className="text-lg font-semibold">{titre}</h2>
      {note && <p className="mt-0.5 text-sm text-[var(--adm-gris)]">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Chiffre({ label, valeur, sous }: { label: string; valeur: string; sous?: string }) {
  return (
    <div>
      <p className="text-sm text-[var(--adm-gris)]">{label}</p>
      <p className="adm-display mt-0.5 text-[28px] font-bold leading-none">{valeur}</p>
      {sous && <p className="mt-1.5 text-xs text-[var(--adm-gris)]">{sous}</p>}
    </div>
  )
}

function NonMesure({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-md bg-[#f5a62322] px-3 py-2 text-sm text-[#7a4e00]">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

function Service({ nom, up, ms, detail }: { nom: string; up: boolean; ms: number | null; detail?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--adm-trait)] px-3 py-3">
      <div className="min-w-0">
        <p className="font-semibold">{nom}</p>
        <p className="truncate text-xs text-[var(--adm-gris)]">{detail ?? (ms !== null ? `${ms} ms` : "")}</p>
      </div>
      <Stamp ton={up ? "vert" : "rouge"}>{up ? "En ligne" : "Hors ligne"}</Stamp>
    </div>
  )
}

export default function IAPage() {
  const [d, setD] = useState<IA | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [chargement, setChargement] = useState(true)

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      const res = await iaApi.get()
      if (res.success && res.data) setD(res.data as IA)
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

  const maxVues = d ? Math.max(1, ...d.daily.map((j) => j.views)) : 1

  return (
    <div>
      <AdminHeader
        title="Recommandations"
        description="Mesures réelles sur 30 jours, calculées depuis votre base"
        actions={
          <Button variant="outline" size="sm" onClick={charger} disabled={chargement}>
            <RefreshCw className={`mr-2 h-4 w-4 ${chargement ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        }
      />

      {chargement && !d ? (
        <div className="space-y-4 p-4 sm:p-6">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
      ) : erreur || !d ? (
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 rounded-lg border border-[var(--adm-rouge)] bg-[#d4372b0f] p-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--adm-rouge)]" />
            <div>
              <p className="font-semibold">Les mesures ne se sont pas chargées</p>
              <p className="mt-1 text-sm text-[var(--adm-gris)]">{erreur}</p>
              <Button size="sm" className="mt-3" onClick={charger}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 sm:p-6">
          {/* Alertes : uniquement des constats réels */}
          {d.alerts.length > 0 && (
            <ul className="space-y-2">
              {d.alerts.map((a, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                    a.level === "critical" ? "border-[var(--adm-rouge)] bg-[#d4372b0f]" : "border-[var(--adm-ambre)] bg-[#f5a62318]"
                  }`}
                >
                  <TriangleAlert className={`mt-0.5 h-4 w-4 shrink-0 ${a.level === "critical" ? "text-[var(--adm-rouge)]" : "text-[#9a6200]"}`} />
                  <span>{a.message}</span>
                </li>
              ))}
            </ul>
          )}

          <Bloc titre="Services">
            <div className="grid gap-3 md:grid-cols-3">
              <Service
                nom="Moteur de recommandation (ALS)"
                up={d.services.als.up}
                ms={d.services.als.ms}
                detail={
                  d.services.als.up
                    ? `${d.services.als.trained ? "Entraîné" : "Non entraîné"} · ${formatNombre(d.services.als.users)} utilisateurs · ${formatNombre(d.services.als.products)} produits`
                    : undefined
                }
              />
              <Service nom="Service temps réel" up={d.services.realtime.up} ms={d.services.realtime.ms} />
              <Service nom="Base de données" up={d.services.database.up} ms={d.services.database.ms} />
            </div>
            <p className="mt-3 text-sm text-[var(--adm-gris)]">
              Serveur : charge {d.system.load1 ?? "—"} sur {d.system.cpus} cœurs, mémoire utilisée à {d.system.memoryUsedPct ?? "—"} %.
            </p>
          </Bloc>

          <Bloc titre="Trafic et clics" note={`Dernière interaction enregistrée : ${formatDateHeure(d.interactions.lastAt)}`}>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
              <Chiffre label="Produits vus" valeur={formatNombre(d.interactions.views)} />
              <Chiffre label="Clics" valeur={formatNombre(d.interactions.clicks)} sous={`Taux de clic ${pct(d.interactions.ctr)}`} />
              <Chiffre label="Ajouts au panier" valeur={formatNombre(d.interactions.carts)} />
              <Chiffre label="Achats" valeur={formatNombre(d.interactions.purchases)} />
              <Chiffre label="Messages à Adu" valeur={formatNombre(d.interactions.chat)} />
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Produits vus par jour (14 jours)</p>
              <div className="flex h-24 items-end gap-1 border-b border-[var(--adm-trait)]" role="img" aria-label="Produits vus par jour">
                {d.daily.map((j, i) => (
                  <div
                    key={j.date}
                    className="adm-barre flex-1 rounded-t-[2px] bg-[var(--adm-encre)]"
                    style={{ height: `${Math.max(3, (j.views / maxVues) * 100)}%`, animationDelay: `${i * 25}ms` }}
                    title={`${j.date} : ${j.views} vues, ${j.clicks} clics`}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-xs text-[var(--adm-gris)]">
                <span>{d.daily[0]?.date}</span>
                <span>{d.daily[d.daily.length - 1]?.date}</span>
              </div>
            </div>
          </Bloc>

          <div className="grid gap-4 xl:grid-cols-2">
            <Bloc titre="Où les clients cliquent" note="Taux de clic par emplacement">
              <ul className="divide-y divide-dashed divide-[var(--adm-trait)]">
                {d.contexts.map((c) => (
                  <li key={c.context} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="font-semibold">{CONTEXTES[c.context] ?? c.context}</p>
                      <p className="text-xs text-[var(--adm-gris)]">
                        {formatNombre(c.views)} vues · {formatNombre(c.clicks)} clics
                      </p>
                    </div>
                    <span className="adm-display text-xl font-bold">{pct(c.ctr)}</span>
                  </li>
                ))}
              </ul>
            </Bloc>

            <Bloc titre="Visiteurs anonymes et connectés" note="Comportement sur 30 jours">
              <div className="grid grid-cols-2 gap-5">
                <Chiffre label="Anonymes" valeur={pct(d.visitors.anonymous.ctr)} sous={`${formatNombre(d.visitors.anonymous.views)} vues, ${formatNombre(d.visitors.anonymous.clicks)} clics`} />
                <Chiffre label="Connectés" valeur={pct(d.visitors.known.ctr)} sous={`${formatNombre(d.visitors.known.views)} vues, ${formatNombre(d.visitors.known.clicks)} clics`} />
              </div>
              <div className="adm-perf mt-4 pt-4">
                <Chiffre
                  label="Profils anonymes enregistrés"
                  valeur={formatNombre(d.coldStart.anonymousProfiles)}
                  sous={`${d.coldStart.anonymousNew7d} nouveaux cette semaine · ${d.coldStart.converted} devenus clients`}
                />
              </div>
            </Bloc>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Bloc titre="Couverture du catalogue">
              <p className="adm-display text-[40px] font-bold leading-none">{pct(d.catalog.coveragePct)}</p>
              <p className="mt-2 text-sm text-[var(--adm-gris)]">
                {formatNombre(d.catalog.seen)} produits vus au moins une fois sur {formatNombre(d.catalog.active)} produits actifs.
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-[3px] bg-[var(--adm-trait)]">
                <div className="h-full bg-[var(--adm-rouge)]" style={{ width: `${Math.min(100, d.catalog.coveragePct ?? 0)}%` }} />
              </div>
            </Bloc>

            <Bloc titre="Défilement" note={`${formatNombre(d.scroll.sessions)} sessions sur 30 jours`}>
              <div className="grid grid-cols-2 gap-5">
                <Chiffre label="Produits vus par session" valeur={d.scroll.avgProductsViewed !== null ? String(d.scroll.avgProductsViewed).replace(".", ",") : "—"} sous={`Record : ${d.scroll.maxProductsViewed}`} />
                <Chiffre label="Sessions avec un clic" valeur={formatNombre(d.scroll.sessionsWithClick)} />
              </div>
              {d.scroll.measured === 0 && (
                <div className="mt-4">
                  <NonMesure>La profondeur de défilement et le temps passé ne sont pas enregistrés par le site. Ils restent « non mesurés » tant que ce suivi n'est pas ajouté.</NonMesure>
                </div>
              )}
            </Bloc>
          </div>

          <Bloc titre="Scores « Pour vous »" note="Ce qui alimente les recommandations personnalisées">
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              <Chiffre label="Scores calculés" valeur={formatNombre(d.forYou.scores)} sous={`${formatNombre(d.forYou.products)} produits, ${d.forYou.users} utilisateurs`} />
              <Chiffre label="Scores expirés" valeur={formatNombre(d.forYou.expired)} />
              <Chiffre label="Dernier calcul" valeur={d.forYou.lastCalculatedAt ? formatDateHeure(d.forYou.lastCalculatedAt) : "—"} />
              <Chiffre label="Scores du fil" valeur={formatNombre(d.forYou.feedScores)} />
            </div>
            {d.forYou.scores > 0 && d.forYou.expired === d.forYou.scores && (
              <div className="mt-4">
                <NonMesure>Tous les scores sont expirés et le dernier calcul est ancien : la personnalisation « Pour vous » n'est plus mise à jour.</NonMesure>
              </div>
            )}
          </Bloc>

          <Bloc titre="Avis sur Adu" note="Retours laissés par les clients dans le chat">
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              <Chiffre label="Avis reçus" valeur={formatNombre(d.chat.feedbacks)} />
              <Chiffre label="Note moyenne" valeur={d.chat.avgRating !== null ? `${String(d.chat.avgRating).replace(".", ",")} / 5` : "—"} sous={`sur ${d.chat.rated} notes`} />
              <Chiffre
                label="Recommanderaient"
                valeur={d.chat.recommendAnswered > 0 ? `${d.chat.recommendYes} sur ${d.chat.recommendAnswered}` : "—"}
              />
              <div>
                <p className="text-sm text-[var(--adm-gris)]">Ton des messages</p>
                <ul className="mt-1 space-y-0.5 text-sm">
                  {d.chat.sentiments.map((s) => (
                    <li key={s.sentiment} className="flex justify-between gap-3">
                      <span>{SENTIMENTS[s.sentiment] ?? s.sentiment}</span>
                      <span className="font-semibold">{s.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Bloc>
        </div>
      )}
    </div>
  )
}

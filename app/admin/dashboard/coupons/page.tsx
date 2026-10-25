"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Power, RefreshCw, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { AdminHeader } from "@/components/admin/header"
import { Stamp } from "@/components/admin/stamp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { couponsApi } from "@/lib/admin/api-client"
import { formatFCFA, formatDate, type Ton } from "@/lib/admin/format"

type CouponType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING"

interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minPurchase?: number | null
  maxDiscount?: number | null
  usageLimit?: number | null
  perUserLimit?: number | null
  usedCount?: number
  usageCount?: number
  startDate?: string | null
  endDate?: string | null
  isActive: boolean
}

const TYPES: Record<CouponType, string> = {
  PERCENTAGE: "Pourcentage",
  FIXED_AMOUNT: "Montant fixe",
  FREE_SHIPPING: "Livraison offerte",
}

function valeurCourte(c: Coupon) {
  if (c.type === "PERCENTAGE") return `−${c.value} %`
  if (c.type === "FIXED_AMOUNT") return `−${new Intl.NumberFormat("fr-FR").format(c.value).replace(/ | /g, " ")}`
  return "Livraison"
}

function etat(c: Coupon): { label: string; ton: Ton } {
  const now = Date.now()
  const used = c.usedCount ?? c.usageCount ?? 0
  if (!c.isActive) return { label: "Désactivé", ton: "gris" }
  if (c.endDate && new Date(c.endDate).getTime() < now) return { label: "Expiré", ton: "rouge" }
  if (c.startDate && new Date(c.startDate).getTime() > now) return { label: "À venir", ton: "bleu" }
  if (c.usageLimit && used >= c.usageLimit) return { label: "Épuisé", ton: "ambre" }
  return { label: "Actif", ton: "vert" }
}

const VIDE = {
  code: "",
  type: "PERCENTAGE" as CouponType,
  value: "",
  minPurchase: "",
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "",
  startDate: "",
  endDate: "",
}

function versDate(iso?: string | null) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : ""
}

function Ticket({ c, onEdit, onToggle, onDelete }: { c: Coupon; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const e = etat(c)
  const used = c.usedCount ?? c.usageCount ?? 0
  return (
    <li className="relative flex overflow-hidden rounded-lg border border-[var(--adm-trait)] bg-[var(--adm-papier)]">
      <div className="flex w-[7.5rem] shrink-0 flex-col items-center justify-center gap-1 bg-[var(--adm-encre)] px-2 py-5 text-center text-white">
        <span className="adm-display text-[26px] font-bold leading-none text-[var(--adm-ambre)]">{valeurCourte(c)}</span>
        {c.type === "FIXED_AMOUNT" && <span className="text-xs text-[#b9c0bb]">FCFA</span>}
        {c.type === "PERCENTAGE" && c.maxDiscount ? <span className="text-xs text-[#b9c0bb]">max {formatFCFA(c.maxDiscount)}</span> : null}
      </div>
      <span className="absolute left-[7.5rem] top-[-9px] h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-[var(--adm-quai)] border border-[var(--adm-trait)]" aria-hidden />
      <span className="absolute bottom-[-9px] left-[7.5rem] h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-[var(--adm-quai)] border border-[var(--adm-trait)]" aria-hidden />
      <div className="min-w-0 flex-1 border-l-[1.5px] border-dashed border-[var(--adm-trait)] p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="adm-display truncate text-xl font-bold tracking-wide">{c.code}</p>
          <Stamp ton={e.ton}>{e.label}</Stamp>
        </div>
        <p className="mt-1 text-sm text-[var(--adm-gris)]">{TYPES[c.type]}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
          <div>
            <dt className="text-xs text-[var(--adm-gris)]">Utilisations</dt>
            <dd className="font-semibold">
              {used}
              {c.usageLimit ? ` / ${c.usageLimit}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--adm-gris)]">Panier minimum</dt>
            <dd className="font-semibold">{c.minPurchase ? formatFCFA(c.minPurchase) : "Aucun"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--adm-gris)]">Valable</dt>
            <dd className="font-semibold">
              {c.startDate || c.endDate
                ? `${c.startDate ? formatDate(c.startDate) : "…"} → ${c.endDate ? formatDate(c.endDate) : "sans fin"}`
                : "Sans limite de date"}
            </dd>
          </div>
          {c.perUserLimit ? (
            <div>
              <dt className="text-xs text-[var(--adm-gris)]">Par client</dt>
              <dd className="font-semibold">{c.perUserLimit} max</dd>
            </div>
          ) : null}
        </dl>
        <div className="adm-perf mt-3 flex flex-wrap gap-2 pt-3">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Modifier
          </Button>
          <Button variant="outline" size="sm" onClick={onToggle}>
            <Power className="mr-1.5 h-3.5 w-3.5" />
            {c.isActive ? "Désactiver" : "Activer"}
          </Button>
          <Button variant="ghost" size="sm" className="text-[var(--adm-rouge)]" onClick={onDelete} aria-label={`Supprimer ${c.code}`}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </li>
  )
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [ouvert, setOuvert] = useState(false)
  const [edition, setEdition] = useState<Coupon | null>(null)
  const [form, setForm] = useState(VIDE)
  const [envoi, setEnvoi] = useState(false)

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      const res = await couponsApi.list()
      setCoupons((res.coupons as Coupon[]) ?? [])
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Impossible de charger les coupons.")
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    charger()
  }, [charger])

  function nouveau() {
    setEdition(null)
    setForm(VIDE)
    setOuvert(true)
  }
  function modifier(c: Coupon) {
    setEdition(c)
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value ?? ""),
      minPurchase: c.minPurchase ? String(c.minPurchase) : "",
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      perUserLimit: c.perUserLimit ? String(c.perUserLimit) : "",
      startDate: versDate(c.startDate),
      endDate: versDate(c.endDate),
    })
    setOuvert(true)
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault()
    const code = form.code.trim().toUpperCase()
    if (!code) return toast.error("Saisissez un code.")
    if (form.type !== "FREE_SHIPPING" && (form.value === "" || Number(form.value) <= 0)) return toast.error("Saisissez une valeur supérieure à 0.")
    if (form.type === "PERCENTAGE" && Number(form.value) > 100) return toast.error("Un pourcentage ne peut pas dépasser 100.")

    const payload: Record<string, unknown> = {
      code,
      type: form.type,
      value: form.type === "FREE_SHIPPING" ? 0 : Number(form.value),
      applicableTo: "ALL_PRODUCTS",
    }
    if (form.minPurchase) payload.minPurchase = Number(form.minPurchase)
    if (form.maxDiscount && form.type === "PERCENTAGE") payload.maxDiscount = Number(form.maxDiscount)
    if (form.usageLimit) payload.usageLimit = Number(form.usageLimit)
    if (form.perUserLimit) payload.perUserLimit = Number(form.perUserLimit)
    if (form.startDate) payload.startDate = `${form.startDate}T00:00:00.000Z`
    if (form.endDate) payload.endDate = `${form.endDate}T23:59:59.000Z`

    setEnvoi(true)
    try {
      if (edition) await couponsApi.update(edition.id, payload)
      else await couponsApi.create({ ...payload, isActive: true })
      toast.success(edition ? "Coupon modifié" : "Coupon créé")
      setOuvert(false)
      charger()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enregistrement impossible.")
    } finally {
      setEnvoi(false)
    }
  }

  async function basculer(c: Coupon) {
    try {
      await couponsApi.update(c.id, { isActive: !c.isActive })
      toast.success(c.isActive ? "Coupon désactivé" : "Coupon activé")
      charger()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action impossible.")
    }
  }

  async function supprimer(c: Coupon) {
    if (!confirm(`Supprimer le coupon ${c.code} ? Désactiver suffit si vous voulez seulement l'arrêter.`)) return
    try {
      await couponsApi.remove(c.id)
      toast.success("Coupon supprimé")
      charger()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible.")
    }
  }

  const maj = (k: keyof typeof VIDE) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <div>
      <AdminHeader
        title="Coupons"
        description="Codes de réduction et leurs utilisations"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={charger} disabled={chargement}>
              <RefreshCw className={`mr-2 h-4 w-4 ${chargement ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button size="sm" onClick={nouveau}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau coupon
            </Button>
          </>
        }
      />

      <div className="p-4 sm:p-6">
        {chargement && coupons.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : erreur ? (
          <div className="flex items-start gap-3 rounded-lg border border-[var(--adm-rouge)] bg-[#d4372b0f] p-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--adm-rouge)]" />
            <div>
              <p className="font-semibold">Les coupons ne se sont pas chargés</p>
              <p className="mt-1 text-sm text-[var(--adm-gris)]">{erreur}</p>
              <Button size="sm" className="mt-3" onClick={charger}>
                Réessayer
              </Button>
            </div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--adm-trait)] bg-[var(--adm-papier)] px-4 py-14 text-center">
            <p className="adm-display text-xl font-bold">Aucun coupon pour le moment</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--adm-gris)]">
              Créez un code pour vos clients, ou un coupon à 100 % pour tester un paiement réel.
            </p>
            <Button className="mt-4" onClick={nouveau}>
              <Plus className="mr-2 h-4 w-4" />
              Créer le premier coupon
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {coupons.map((c) => (
              <Ticket key={c.id} c={c} onEdit={() => modifier(c)} onToggle={() => basculer(c)} onDelete={() => supprimer(c)} />
            ))}
          </ul>
        )}
      </div>

      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{edition ? `Modifier ${edition.code}` : "Nouveau coupon"}</DialogTitle>
            <DialogDescription>Les champs vides n'imposent aucune limite.</DialogDescription>
          </DialogHeader>
          <form onSubmit={enregistrer} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-code">Code</Label>
              <Input id="c-code" value={form.code} onChange={maj("code")} placeholder="BIENVENUE10" className="uppercase" disabled={!!edition} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type de réduction</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CouponType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPES).map(([k, l]) => (
                      <SelectItem key={k} value={k}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.type !== "FREE_SHIPPING" && (
                <div className="space-y-1.5">
                  <Label htmlFor="c-val">{form.type === "PERCENTAGE" ? "Pourcentage" : "Montant (FCFA)"}</Label>
                  <Input id="c-val" type="number" inputMode="numeric" min={0} max={form.type === "PERCENTAGE" ? 100 : undefined} value={form.value} onChange={maj("value")} required />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-min">Panier minimum (FCFA)</Label>
                <Input id="c-min" type="number" inputMode="numeric" min={0} value={form.minPurchase} onChange={maj("minPurchase")} />
              </div>
              {form.type === "PERCENTAGE" && (
                <div className="space-y-1.5">
                  <Label htmlFor="c-max">Réduction maximale (FCFA)</Label>
                  <Input id="c-max" type="number" inputMode="numeric" min={0} value={form.maxDiscount} onChange={maj("maxDiscount")} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-lim">Utilisations au total</Label>
                <Input id="c-lim" type="number" inputMode="numeric" min={1} value={form.usageLimit} onChange={maj("usageLimit")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-usr">Par client</Label>
                <Input id="c-usr" type="number" inputMode="numeric" min={1} value={form.perUserLimit} onChange={maj("perUserLimit")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-ds">Début</Label>
                <Input id="c-ds" type="date" value={form.startDate} onChange={maj("startDate")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-de">Fin</Label>
                <Input id="c-de" type="date" value={form.endDate} onChange={maj("endDate")} />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOuvert(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={envoi}>
                {envoi ? "Enregistrement…" : edition ? "Enregistrer les changements" : "Créer le coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

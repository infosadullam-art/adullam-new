"use client"

import { useState } from "react"
import Link from "next/link"

// ════════════════════════════════════════════════════════════
// ICÔNES — mêmes dessins maison que le reste du site
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string }

const IconFactory = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3.5 20V11l5-3v3l5-3v3l5-3v12H3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M16.5 8V5.2h2V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7 20v-4h3v4M13.5 20v-3h3v3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

const IconSmartphone = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M10.5 18.3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconTruck = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3.5 7h9.5v9H3.5V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M13 10h3.6L20 13.2V16h-7v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="7" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="16.5" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

const IconArrowRight = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12h15.5M14 6.2 19.8 12l-5.8 5.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconArrowDown = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4v15.5M6.2 14l5.8 5.8 5.8-5.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconCopy = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15.5 8.5V6a1.8 1.8 0 0 0-1.8-1.8H6A1.8 1.8 0 0 0 4.2 6v7.7A1.8 1.8 0 0 0 6 15.5h2.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

const IconCheck = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconQuote = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7.5 8.5C5 8.5 3.5 10.3 3.5 12.8c0 2.2 1.5 3.7 3.4 3.7 1.7 0 2.9-1.2 2.9-2.8 0-1.5-1-2.5-2.3-2.6.1-1.3 1.2-2.4 2.5-2.7l-.3-1.5c-.7.1-1.4.3-2.2.6Z" fill="currentColor" />
    <path d="M16.5 8.5c-2.5 0-4 1.8-4 4.3 0 2.2 1.5 3.7 3.4 3.7 1.7 0 2.9-1.2 2.9-2.8 0-1.5-1-2.5-2.3-2.6.1-1.3 1.2-2.4 2.5-2.7l-.3-1.5c-.7.1-1.4.3-2.2.6Z" fill="currentColor" />
  </svg>
)

const IconPriceUp = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 16.5 9.5 11l3.5 3.5L20 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 7h5.5v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconShieldAlert = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3.5 19 6.3v5.4c0 4.4-2.9 7.6-7 8.8-4.1-1.2-7-4.4-7-8.8V6.3L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 8.3v4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="15.4" r="0.9" fill="currentColor" />
  </svg>
)

const IconTangle = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M4 8c2.5-2 5-2 6 0s-1 4-3 3-1-5 2.5-5.5S15 8 13 11s-4.5 1-4 3.5 4 3 6 1 1.5-5 3.5-4.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const IconShieldCheck = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3.5 19 6.3v5.4c0 4.4-2.9 7.6-7 8.8-4.1-1.2-7-4.4-7-8.8V6.3L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 12.3l2.1 2.1L15.3 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconSearchProduct = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15 15l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconRoute = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="5.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18.5" cy="18" r="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5.5 8v3a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2.2 2.2" />
  </svg>
)

const IconHomeCheck = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 10v9h11v-9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9.7 14.3l1.6 1.6 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconBriefcase = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3.5" y="8" width="17" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M3.5 13h17" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

const IconStore = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4.5h16l1.5 5.2a2.3 2.3 0 0 1-4.4 1.1 2.3 2.3 0 0 1-4.3 0 2.3 2.3 0 0 1-4.3 0 2.3 2.3 0 0 1-4.4-1.1L4 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M5.5 10.8V19.5h13V10.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M10 19.5v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

const IconUsers = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="9" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.8 19v-1.3c0-2.3 2.3-4.2 5.2-4.2s5.2 1.9 5.2 4.2V19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="16.3" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15 13.7c2.4.1 4.3 1.7 4.3 3.8V19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconBuilding = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="3" width="10" height="17" rx="1" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15 9h4v11h-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M8 6.8h1.2M11.3 6.8h1.2M8 10h1.2M11.3 10h1.2M8 13.2h1.2M11.3 13.2h1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const SOURCING_URL = "/boutique-noel"
const COUPON_CODE = "ECOMCONNECT"

const PROBLEMES = [
  { icon: IconPriceUp, titre: "Trop cher", texte: "Les intermédiaires font monter les prix de 2 à 3 fois." },
  { icon: IconShieldAlert, titre: "Trop risqué", texte: "Payer avant de recevoir, sans aucune garantie." },
  { icon: IconTangle, titre: "Trop compliqué", texte: "Fournisseurs introuvables, logistique opaque." },
]

const SOLUTIONS = [
  { icon: IconFactory, text: "Prix usine direct — sans intermédiaire" },
  { icon: IconSmartphone, text: "Paiement par Mobile Money dans votre devise" },
  { icon: IconTruck, text: "Livraison porte-à-porte garantie ou remboursée" },
]

const ETAPES = [
  { icon: IconSearchProduct, titre: "Tu choisis ton produit", texte: "Ou tu décris simplement ce que tu cherches." },
  { icon: IconRoute, titre: "On s'occupe de tout", texte: "On localise le fabricant et on gère toute la logistique." },
  { icon: IconHomeCheck, titre: "Tu reçois chez toi", texte: "Garanti ou remboursé." },
]

const DELAIS = [
  { label: "Express", valeur: "10 j" },
  { label: "Air", valeur: "15-17 j" },
  { label: "Mer", valeur: "45-50 j" },
]

const APPRENTISSAGES = [
  "Commander directement depuis un fabricant en Chine, sans intermédiaire",
  "Utiliser le sourcing à la demande — décrire un produit, recevoir un devis en 48h",
  "Payer par mobile money et vous faire livrer porte-à-porte",
  "Comprendre comment la garantie de remboursement protège votre investissement",
  "Voir une démonstration live sur la plateforme",
]

const GARANTIES = [
  {
    icon: IconShieldCheck,
    titre: "Garanti ou remboursé",
    texte: "Si votre colis n'arrive pas dans les délais, vous êtes remboursé intégralement. Aucune question.",
  },
  {
    icon: IconFactory,
    titre: "Prix usine direct",
    texte: "Vous payez le prix du fabricant. Zéro intermédiaire, zéro surcoût caché.",
  },
  {
    icon: IconSmartphone,
    titre: "Mobile money natif",
    texte: "Mobile Money et carte bancaire. Vous payez dans votre devise locale.",
  },
]

const PROFILS = [
  { icon: IconBriefcase, texte: "PME importatrices en Afrique francophone" },
  { icon: IconStore, texte: "Revendeurs et grossistes qui veulent réduire leurs coûts" },
  { icon: IconUsers, texte: "Coopératives qui commandent en groupe" },
  { icon: IconBuilding, texte: "Toute entreprise qui veut accéder au prix fabricant" },
]

export default function EcomConnectPage() {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(COUPON_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <header className="py-5 border-b border-border">
        <div className="max-w-3xl mx-auto px-5">
          <span className="font-logo text-foreground" style={{ fontSize: "20px" }}>
            adul<span className="text-accent">.</span>lam
          </span>
        </div>
      </header>

      <main>
        {/* ═══════════════ BLOC 1 — HERO ═══════════════ */}
        <section className="py-14 lg:py-20 bg-brand">
          <div className="anim-fade-up max-w-2xl mx-auto px-5 text-center">
            <h1 className="text-2xl lg:text-4xl font-extrabold tracking-[-0.02em] text-white leading-tight mb-4">
              Merci d&apos;avoir participé au webinaire<br className="hidden sm:block" /> ecomConnect x Adullam
            </h1>
            <p className="text-base lg:text-lg text-white/75 mb-8 max-w-xl mx-auto">
              Commandez directement depuis les usines. On gère tout. Garanti ou remboursé.
            </p>
            <Link
              href={SOURCING_URL}
              className="inline-flex items-center gap-2 rounded-lg px-7 py-4 text-base font-bold text-white bg-accent hover:bg-accent-hover transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              Faire ma première demande de sourcing
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ═══════════════ SECTION 1 — POURQUOI ADULLAM ═══════════════ */}
        <section className="py-14 lg:py-16 bg-surface">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="anim-fade-up text-xl lg:text-2xl font-extrabold text-foreground text-center mb-10 max-w-lg mx-auto leading-snug">
              Commander depuis la Chine ne devrait pas être compliqué
            </h2>

            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              {PROBLEMES.map(({ icon: Icon, titre, texte }, i) => (
                <div
                  key={titre}
                  className="anim-fade-up rounded-xl bg-background p-5 text-center shadow-xs"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-light mx-auto mb-3">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1.5">{titre}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{texte}</p>
                </div>
              ))}
            </div>

            <div className="anim-fade-up flex flex-col items-center gap-2 mb-8">
              <IconArrowDown className="w-5 h-5 text-accent" />
              <p className="text-sm font-semibold text-accent">Adullam résout les 3.</p>
            </div>

            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {SOLUTIONS.map(({ icon: Icon, text }, i) => (
                <div
                  key={text}
                  className="anim-fade-up flex-shrink-0 w-[210px] sm:w-auto snap-center flex flex-col items-center text-center gap-3"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent-light">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 2 — COMMENT ÇA MARCHE ═══════════════ */}
        <section className="py-14 lg:py-16 bg-background">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="anim-fade-up text-xl lg:text-2xl font-extrabold text-foreground text-center mb-10">
              Commander en 3 étapes simples
            </h2>

            <div className="grid sm:grid-cols-3 gap-8">
              {ETAPES.map(({ icon: Icon, titre, texte }, i) => (
                <div key={titre} className="anim-fade-up relative" style={{ animationDelay: `${i * 100}ms` }}>
                  {i < ETAPES.length - 1 && (
                    <IconArrowRight className="hidden sm:block absolute -right-6 top-6 w-4 h-4 text-border" />
                  )}
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-accent-light">
                      <Icon className="w-6 h-6 text-accent" />
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{titre}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">{texte}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="anim-fade-up flex justify-center gap-3 mt-10 flex-wrap">
              {DELAIS.map((d) => (
                <div key={d.label} className="flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 shadow-xs">
                  <span className="text-xs font-semibold text-foreground">{d.label}</span>
                  <span className="text-xs text-muted-foreground">{d.valeur}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 3 — CE QUE VOUS APPRENDREZ ═══════════════ */}
        <section className="py-14 lg:py-16 bg-surface">
          <div className="max-w-xl mx-auto px-5">
            <h2 className="anim-fade-up text-xl lg:text-2xl font-extrabold text-foreground text-center mb-9">
              Ce que vous allez découvrir lors de ce webinaire
            </h2>
            <ul className="space-y-4">
              {APPRENTISSAGES.map((item, i) => (
                <li key={item} className="anim-fade-up flex items-start gap-3" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent mt-0.5">
                    <IconCheck className="w-3 h-3 text-white" />
                  </span>
                  <p className="text-sm lg:text-base text-foreground leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ═══════════════ SECTION 4 — LES GARANTIES ═══════════════ */}
        <section className="py-14 lg:py-16 bg-brand">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="anim-fade-up text-xl lg:text-2xl font-extrabold text-white text-center mb-9">
              Vos achats sont protégés
            </h2>

            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {GARANTIES.map(({ icon: Icon, titre, texte }, i) => (
                <div
                  key={titre}
                  className="anim-fade-up flex-shrink-0 w-[250px] sm:w-auto snap-center rounded-2xl bg-white/10 p-6 text-center"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/15 mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white mb-2">{titre}</p>
                  <p className="text-xs text-white/70 leading-relaxed">{texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 5 — TÉMOIGNAGE ═══════════════ */}
        <section className="py-14 lg:py-16 bg-accent-light">
          <div className="anim-fade-up max-w-xl mx-auto px-5 text-center">
            <IconQuote className="w-8 h-8 text-accent mx-auto mb-4" />
            <p className="text-base lg:text-lg font-medium text-foreground leading-relaxed mb-5">
              &laquo;&nbsp;Avec Adullam, j&apos;ai commandé directement depuis la Chine sans stress. Livré chez moi, au bon prix.&nbsp;&raquo;
            </p>
            <p className="text-sm font-semibold text-foreground">Emilienne Christine Essinga Mendjogo</p>
            <p className="text-xs text-muted-foreground">Ma Signature Business CM · Cameroun</p>
          </div>
        </section>

        {/* ═══════════════ SECTION 6 — À QUI S'ADRESSE CE WEBINAIRE ═══════════════ */}
        <section className="py-14 lg:py-16 bg-background">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="anim-fade-up text-xl lg:text-2xl font-extrabold text-foreground text-center mb-9">
              Ce webinaire est fait pour vous si...
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {PROFILS.map(({ icon: Icon, texte }, i) => (
                <div key={texte} className="anim-fade-up flex flex-col items-center text-center gap-3" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent-light">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">{texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 7 — CTA FINAL ═══════════════ */}
        <section className="py-14 lg:py-20 bg-brand">
          <div className="anim-fade-up max-w-xl mx-auto px-5 text-center">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white mb-8">
              Prêt à commander à la source ?
            </h2>

            <div
              className="anim-scale-in rounded-2xl p-6 lg:p-7 text-center shadow-lg mb-8"
              style={{ background: "var(--accent-amber)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/90 mb-3">
                Offre exclusive participants ecomConnect
              </p>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2.5 mb-4 rounded-lg px-5 py-3 bg-white/15 hover:bg-white/25 transition-colors"
              >
                <span className="text-xl lg:text-2xl font-black tracking-[0.08em] text-white">
                  {COUPON_CODE}
                </span>
                {copied ? <IconCheck className="w-5 h-5 text-white" /> : <IconCopy className="w-5 h-5 text-white" />}
              </button>

              <p className="text-sm lg:text-base font-medium text-white">
                Première demande de sourcing prioritaire — traitement en 24h au lieu de 48h
              </p>
              <p className="text-xs text-white/70 mt-1">
                {copied ? "Code copié !" : "Cliquez sur le code pour le copier"}
              </p>
            </div>

            <Link
              href={SOURCING_URL}
              className="inline-flex items-center gap-2 rounded-lg px-7 py-4 text-base font-bold text-white bg-accent hover:bg-accent-hover transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              Faire ma première demande de sourcing
              <IconArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-white/60 mt-3">
              Réponse sous 24h pour les participants ecomConnect
            </p>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Adullam Global — adullamarket.com
        </p>
      </footer>
    </div>
  )
}
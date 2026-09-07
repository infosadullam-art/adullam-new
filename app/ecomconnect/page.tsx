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

const SOURCING_URL = "/boutique-noel"
const COUPON_CODE = "ECOMCONNECT"

export default function EcomConnectPage() {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(COUPON_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* En-tête minimal — page de conversion, on évite de distraire avec la navigation complète du site */}
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

        {/* ═══════════════ BLOC 2 — CE QU'ADULLAM FAIT POUR VOUS ═══════════════ */}
        <section className="py-14 lg:py-16 bg-surface">
          <div className="max-w-3xl mx-auto px-5">
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: IconFactory, text: "Prix usine direct — sans intermédiaire" },
                { icon: IconSmartphone, text: "Paiement par Mobile Money dans votre devise" },
                { icon: IconTruck, text: "Livraison porte-à-porte garantie ou remboursée" },
              ].map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  className="anim-fade-up flex flex-col items-center text-center gap-3"
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

        {/* ═══════════════ BLOC 3 — CODE EXCLUSIF PARTICIPANTS ═══════════════ */}
        <section className="py-12 lg:py-16 bg-background">
          <div className="max-w-2xl mx-auto px-5">
            <div
              className="anim-scale-in rounded-2xl p-6 lg:p-8 text-center shadow-lg"
              style={{ background: 'var(--accent-amber)' }}
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
                {copied ? (
                  <IconCheck className="w-5 h-5 text-white" />
                ) : (
                  <IconCopy className="w-5 h-5 text-white" />
                )}
              </button>

              <p className="text-sm lg:text-base font-medium text-white">
                Première demande de sourcing prioritaire — traitement en 24h au lieu de 48h
              </p>
              <p className="text-xs text-white/70 mt-1">
                {copied ? "Code copié !" : "Cliquez sur le code pour le copier"}
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════ BLOC 4 — TÉMOIGNAGE ═══════════════ */}
        <section className="py-12 lg:py-16 bg-surface">
          <div className="anim-fade-up max-w-xl mx-auto px-5 text-center">
            <IconQuote className="w-8 h-8 text-accent mx-auto mb-4" />
            <p className="text-base lg:text-lg font-medium text-foreground leading-relaxed mb-5">
              &laquo;&nbsp;Avec Adullam, j&apos;ai commandé directement depuis la Chine sans stress. Livré chez moi, au bon prix.&nbsp;&raquo;
            </p>
            <p className="text-sm font-semibold text-foreground">Emilienne Christine Essinga Mendjogo</p>
            <p className="text-xs text-muted-foreground">Ma Signature Business CM · Cameroun</p>
          </div>
        </section>

        {/* ═══════════════ BLOC 5 — CTA FINAL ═══════════════ */}
        <section className="py-14 lg:py-20 bg-brand">
          <div className="anim-fade-up max-w-xl mx-auto px-5 text-center">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white mb-6">
              Prêt à commander à la source ?
            </h2>
            <Link
              href={SOURCING_URL}
              className="inline-flex items-center gap-2 rounded-lg px-7 py-4 text-base font-bold text-white bg-accent hover:bg-accent-hover transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              Commencer maintenant
              <IconArrowRight className="w-4 h-4" />
            </Link>
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
"use client"

export function LoadingOverlay({ active }: { active: boolean }) {
  return (
    <div
      className={`loader-overlay ${active ? "active" : ""}`}
      aria-hidden={!active}
      role="status"
      aria-live="polite"
      aria-busy={active}
    >
      <div className="loader-center">
        <div className="loader-logo">
          adul<span className="text-accent">.</span>lam
        </div>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" />
        </div>
        <span className="sr-only">Chargement en cours</span>
      </div>
    </div>
  )
}
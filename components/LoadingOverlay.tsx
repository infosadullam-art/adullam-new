"use client"

export function LoadingOverlay({ active }: { active: boolean }) {
  return (
    <div className={`loader-overlay ${active ? "active" : ""}`} aria-hidden={!active}>
      <div className="loader-center">
        <div className="loader-logo">
          adul<span className="text-accent">.</span>lam
        </div>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" />
        </div>
      </div>
    </div>
  )
}

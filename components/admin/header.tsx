"use client"

import type React from "react"

interface AdminHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  backButton?: React.ReactNode
}

// Même API qu'avant (title, description, actions) + backButton déjà utilisé par plusieurs pages.
// La fausse recherche et la fausse cloche ont été retirées.
export function AdminHeader({ title, description, actions, backButton }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--adm-trait)] bg-[var(--adm-quai)]/95 backdrop-blur">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {backButton}
          <div className="min-w-0">
            <h1 className="adm-display truncate text-2xl font-bold leading-tight sm:text-[28px]">{title}</h1>
            {description && <p className="mt-0.5 text-sm text-[var(--adm-gris)]">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 [&>*]:shrink-0">{actions}</div>}
      </div>
    </header>
  )
}

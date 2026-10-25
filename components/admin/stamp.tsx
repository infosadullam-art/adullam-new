import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { Ton } from "@/lib/admin/format"

// Tampon de statut (remplace les Badge colorés de l'ancien admin)
export function Stamp({ ton = "gris", children, className }: { ton?: Ton; children: ReactNode; className?: string }) {
  return <span className={cn("adm-stamp", `adm-tone-${ton}`, className)}>{children}</span>
}

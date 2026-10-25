import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  // conservé pour compatibilité avec les anciennes pages ; n'affiche rien d'inventé
  trend?: { value: number; isPositive: boolean }
  className?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-lg border border-[var(--adm-trait)] bg-[var(--adm-papier)] p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-[var(--adm-gris)]">{title}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--adm-gris)]" />}
      </div>
      <p className="adm-display mt-1 text-[28px] font-bold leading-none">{value}</p>
      {(description || trend) && (
        <p className="mt-2 flex items-center gap-2 text-xs text-[var(--adm-gris)]">
          {trend && (
            <span className={cn("adm-stamp", trend.isPositive ? "adm-tone-vert" : "adm-tone-rouge")}>
              {trend.isPositive ? "+" : "−"}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && <span className="truncate">{description}</span>}
        </p>
      )}
    </div>
  )
}

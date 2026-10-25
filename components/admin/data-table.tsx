"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  pagination?: {
    page: number
    totalPages: number
    total?: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    pageSize?: number
    pageSizeOptions?: number[]
  }
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

// Même API qu'avant. Sur ordinateur : un tableau. Sur téléphone : une fiche par ligne
// (1re colonne = titre, colonne sans titre = actions en haut à droite, les autres = « libellé / valeur »).
export function DataTable<T>({
  columns,
  data,
  isLoading,
  pagination,
  emptyMessage = "Rien à afficher pour le moment",
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Chargement">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const colTitre = columns[0]
  const colActions = columns.filter((c) => !c.header)
  const colDetails = columns.slice(1).filter((c) => c.header)

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--adm-trait)] bg-[var(--adm-papier)] px-4 py-12 text-center text-sm text-[var(--adm-gris)]">
          {emptyMessage}
        </div>
      ) : (
        <>
          {/* Ordinateur */}
          <div className="hidden overflow-hidden rounded-lg border border-[var(--adm-trait)] bg-[var(--adm-papier)] md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--adm-trait)] hover:bg-transparent">
                  {columns.map((c) => (
                    <TableHead key={c.key} className={cn("h-11 px-4 text-[13px] font-semibold text-[var(--adm-gris)]", c.className)}>
                      {c.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow
                    key={index}
                    className={cn("border-[var(--adm-trait)]", onRowClick && "cursor-pointer hover:bg-black/[0.03]")}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((c) => (
                      <TableCell key={c.key} className={cn("px-4 py-3", c.className)}>
                        {c.cell(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Téléphone */}
          <ul className="space-y-3 md:hidden">
            {data.map((item, index) => (
              <li
                key={index}
                className={cn(
                  "rounded-lg border border-[var(--adm-trait)] bg-[var(--adm-papier)]",
                  onRowClick && "cursor-pointer active:bg-black/[0.03]",
                )}
                onClick={() => onRowClick?.(item)}
              >
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0 flex-1">{colTitre?.cell(item)}</div>
                  {colActions.length > 0 && (
                    <div className="flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
                      {colActions.map((c) => (
                        <div key={c.key}>{c.cell(item)}</div>
                      ))}
                    </div>
                  )}
                </div>
                {colDetails.length > 0 && (
                  <dl className="adm-perf grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-3 text-sm">
                    {colDetails.map((c) => (
                      <div key={c.key} className="min-w-0">
                        <dt className="text-xs text-[var(--adm-gris)]">{c.header}</dt>
                        <dd className="mt-0.5 min-w-0 [&_a]:!block [&_a]:!p-0 [&>div]:!p-0">{c.cell(item)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--adm-gris)]">
            Page <span className="font-semibold text-[var(--adm-encre)]">{pagination.page}</span> sur {pagination.totalPages}
            {pagination.total ? ` · ${pagination.total} résultats` : ""}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

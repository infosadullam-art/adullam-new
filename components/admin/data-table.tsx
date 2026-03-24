"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export function DataTable<T>({
  columns,
  data,
  isLoading,
  pagination,
  emptyMessage = "No data found",
  onRowClick,
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center space-x-4">
          {Array.from({ length: columns.length }).map((_, i) => (
            <Skeleton key={i} className="h-8 flex-1" />
          ))}
        </div>
        {/* Rows skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            {Array.from({ length: columns.length }).map((_, j) => (
              <Skeleton key={j} className="h-12 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const startItem = pagination ? ((pagination.page - 1) * (pagination.pageSize || 10)) + 1 : 1
  const endItem = pagination 
    ? Math.min(pagination.page * (pagination.pageSize || 10), pagination.total || 0)
    : data.length

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={cn(
                    "h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-4xl">📭</div>
                    <div>{emptyMessage}</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    hoveredRow === index && "bg-muted/30"
                  )}
                  onClick={() => onRowClick?.(item)}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.key} 
                      className={cn("px-4 py-3", column.className)}
                    >
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Info */}
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            {pagination.total ? (
              <span>
                Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
                <span className="font-medium text-foreground">{endItem}</span> of{" "}
                <span className="font-medium text-foreground">{pagination.total}</span> results
              </span>
            ) : (
              <span>
                Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
                <span className="font-medium text-foreground">{pagination.totalPages}</span>
              </span>
            )}
          </div>

          {/* Page Size Selector */}
          {pagination.onPageSizeChange && pagination.pageSizeOptions && (
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={pagination.pageSize?.toString()}
                onValueChange={(value) => pagination.onPageSizeChange?.(parseInt(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pagination.pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center gap-1 order-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = pagination.page
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      pagination.page === pageNum && "pointer-events-none"
                    )}
                    onClick={() => pagination.onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
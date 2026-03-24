"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { StatsCard } from "@/components/admin/stats-card"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { importApi, jobsApi } from "@/lib/admin/api-client"
import { Import, Package, Copy, AlertTriangle, Plus, Play } from "lucide-react"
import { toast } from "sonner"

interface ImportBatch {
  id: string
  source: string
  status: string
  totalItems: number
  processed: number
  failed: number
  createdAt: string
}

interface ImportStats {
  totalBatches: number
  totalProducts: number
  duplicates: number
  fakes: number
  bySource: Record<string, number>
  byStatus: Record<string, number>
}

interface Meta {
  page: number
  totalPages: number
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    COMPLETED: "default",
    PROCESSING: "secondary",
    PENDING: "outline",
    FAILED: "destructive",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

export default function ImportPage() {
  const [batches, setBatches] = useState<ImportBatch[]>([])
  const [stats, setStats] = useState<ImportStats | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [importSource, setImportSource] = useState<string>("ALIBABA")
  const [importData, setImportData] = useState("")

  useEffect(() => {
    loadData()
  }, [page])

  async function loadData() {
    setIsLoading(true)
    try {
      const [batchesRes, statsRes] = await Promise.all([importApi.list({ page, limit: 20 }), importApi.stats()])

      if (batchesRes.success) {
        setBatches(batchesRes.data as ImportBatch[])
        setMeta(batchesRes.meta as Meta)
      }
      if (statsRes.success) {
        setStats(statsRes.data as ImportStats)
      }
    } catch (error) {
      console.error("Failed to load import data:", error)
      toast.error("Failed to load import data")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleImport() {
    try {
      const products = JSON.parse(importData)
      if (!Array.isArray(products)) {
        toast.error("Invalid format: Expected JSON array")
        return
      }

      await importApi.create({ source: importSource, products })
      toast.success("Import batch created")
      setIsDialogOpen(false)
      setImportData("")
      loadData()
    } catch (error) {
      toast.error(error instanceof SyntaxError ? "Invalid JSON format" : "Failed to create import")
    }
  }

  async function triggerJob(queue: string, job: string) {
    try {
      await jobsApi.trigger(queue, job)
      toast.success(`${job} job triggered`)
    } catch (error) {
      toast.error("Failed to trigger job")
    }
  }

  const columns = [
    {
      key: "source",
      header: "Source",
      cell: (batch: ImportBatch) => <span className="font-medium">{batch.source}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (batch: ImportBatch) => getStatusBadge(batch.status),
    },
    {
      key: "items",
      header: "Items",
      cell: (batch: ImportBatch) => (
        <div className="text-sm">
          <span>{batch.totalItems} total</span>
          <span className="text-muted-foreground"> / {batch.processed} processed</span>
          {batch.failed > 0 && <span className="text-destructive"> / {batch.failed} failed</span>}
        </div>
      ),
    },
    {
      key: "date",
      header: "Created",
      cell: (batch: ImportBatch) => (
        <span className="text-sm text-muted-foreground">{new Date(batch.createdAt).toLocaleString()}</span>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader
        title="Import Pipeline"
        description="Manage product imports from external sources"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Import Batch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={importSource} onValueChange={setImportSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALIBABA">Alibaba</SelectItem>
                      <SelectItem value="ALIEXPRESS">AliExpress</SelectItem>
                      <SelectItem value="DUBAI">Dubai</SelectItem>
                      <SelectItem value="TURKEY">Turkey</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="EUROPE">Europe</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Products (JSON Array)</Label>
                  <Textarea
                    placeholder={`[
  {
    "rawTitle": "Product Name",
    "rawDescription": "Description...",
    "rawPrice": 10.99,
    "rawCurrency": "USD",
    "rawImages": ["https://..."],
    "rawCategory": "Electronics"
  }
]`}
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <Button onClick={handleImport} className="w-full">
                  Create Import Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Batches" value={stats?.totalBatches || 0} icon={Import} />
          <StatsCard title="Total Products" value={stats?.totalProducts || 0} icon={Package} />
          <StatsCard title="Duplicates" value={stats?.duplicates || 0} icon={Copy} />
          <StatsCard title="Fakes Detected" value={stats?.fakes || 0} icon={AlertTriangle} />
        </div>

        {/* Job Triggers */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => triggerJob("deduplication", "runDeduplication")}>
                <Play className="mr-2 h-4 w-4" />
                Run Deduplication
              </Button>
              <Button variant="outline" onClick={() => triggerJob("fakeDetection", "runFakeDetection")}>
                <Play className="mr-2 h-4 w-4" />
                Run Fake Detection
              </Button>
              <Button variant="outline" onClick={() => triggerJob("cleanProducts", "cleanProducts")}>
                <Play className="mr-2 h-4 w-4" />
                Clean Products
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>Import Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={batches}
              isLoading={isLoading}
              pagination={
                meta
                  ? {
                      page: meta.page,
                      totalPages: meta.totalPages,
                      onPageChange: setPage,
                    }
                  : undefined
              }
              emptyMessage="No import batches"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
